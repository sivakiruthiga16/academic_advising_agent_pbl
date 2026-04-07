import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';
import Advisor from '../models/Advisor.js';
import AcademicRecord from '../models/AcademicRecord.js';
import mongoose from 'mongoose';
import cache from '../utils/cache.js';

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
export const getAllStudents = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        const cachedData = cache.get('all_students');
        if (cachedData) {
            console.log("Returning cached students list");
            return res.json(cachedData);
        }

        console.log("Using collection:", User.collection.name);
        
        // Optimize: Fetch Student profiles and populate User details in one go if possible
        // Or fetch all students first then all relevant profiles
        const students = await User.find({ role: { $regex: /^student$/i } }).select('-password').lean();
        
        const studentIds = students.map(s => s._id);
        const profiles = await Student.find({ userId: { $in: studentIds } })
            .populate('advisorId', 'name email')
            .lean();
        
        const profileMap = profiles.reduce((acc, p) => {
            acc[p.userId.toString()] = p;
            return acc;
        }, {});

        const enhancedStudents = students.map(user => ({
            ...user,
            profile: profileMap[user._id.toString()] || null
        }));

        cache.set('all_students', enhancedStudents);
        res.json(enhancedStudents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all advisors
// @route   GET /api/admin/advisors
// @access  Private/Admin
export const getAllAdvisors = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        const cachedData = cache.get('all_advisors');
        if (cachedData) {
            console.log("Returning cached advisors list");
            return res.json(cachedData);
        }

        console.log("Using collection:", User.collection.name);
        const advisors = await User.find({ role: { $regex: /^advisor$/i } }).select('-password').lean();
        
        const advisorIds = advisors.map(a => a._id);
        const profiles = await Advisor.find({ userId: { $in: advisorIds } }).lean();
        
        const profileMap = profiles.reduce((acc, p) => {
            acc[p.userId.toString()] = p;
            return acc;
        }, {});

        // Parallelize student count queries (or optimize further with aggregation but this is already better)
        const enhancedAdvisors = await Promise.all(advisors.map(async (user) => {
            const studentCount = await Student.countDocuments({ advisorId: user._id });
            return {
                ...user,
                profile: profileMap[user._id.toString()] || null,
                studentCount
            };
        }));

        cache.set('all_advisors', enhancedAdvisors);
        res.json(enhancedAdvisors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Assign advisor to student
// @route   POST /api/admin/assign-advisor
// @access  Private/Admin
export const assignAdvisor = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { studentId, advisorId } = req.body;

    try {
        console.log("Assigning advisor:", advisorId, "to student:", studentId);
        console.log("Using collection:", Student.collection.name);
        let studentProfile = await Student.findOne({ userId: studentId });
        if (!studentProfile) {
            return res.status(404).json({ msg: 'Student profile not found' });
        }

        // Verify advisor exists
        const advisor = await User.findOne({ _id: advisorId, role: 'advisor' });
        if (!advisor) {
            return res.status(404).json({ msg: 'Advisor not found' });
        }

        studentProfile.advisorId = advisorId;
        await studentProfile.save();
        
        // Clear caches
        cache.del(['all_students', 'all_advisors']);
        
        console.log("MongoDB operation completed successfully");
        res.json({ msg: 'Advisor assigned successfully', student: studentProfile });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add or Update academic record
// @route   POST /api/admin/academic-records
// @access  Private/Admin
export const addAcademicRecord = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { studentId, semester, subjects, cgpa: manualCgpa } = req.body;

    try {
        console.log("Adding/Updating academic record for student:", studentId);
        console.log("Using collection:", AcademicRecord.collection.name);
        // Calculate CGPA if not provided manually
        let semesterGPA;
        if (manualCgpa !== undefined && manualCgpa !== '') {
            semesterGPA = parseFloat(manualCgpa);
        } else {
            let totalMarks = 0;
            let totalSubjects = subjects.length;

            subjects.forEach(sub => {
                totalMarks += parseInt(sub.marks);
                // Auto-assign grade
                if (sub.marks >= 90) sub.grade = 'A+';
                else if (sub.marks >= 80) sub.grade = 'A';
                else if (sub.marks >= 70) sub.grade = 'B';
                else if (sub.marks >= 60) sub.grade = 'C';
                else if (sub.marks >= 50) sub.grade = 'D';
                else sub.grade = 'F';
            });
            semesterGPA = totalSubjects > 0 ? (totalMarks / (totalSubjects * 100)) * 10.0 : 0;
        }

        // Check for existing record for this student and semester to support "Update"
        let record = await AcademicRecord.findOne({ studentId, semester });

        if (record) {
            record.subjects = subjects;
            record.cgpa = semesterGPA.toFixed(2);
            record.updatedAt = Date.now();
            await record.save();
        } else {
            record = new AcademicRecord({
                studentId,
                semester,
                subjects,
                cgpa: semesterGPA.toFixed(2)
            });
            await record.save();
        }
        console.log("MongoDB operation completed successfully");

        // Update Student Overall CGPA (Average of all semesters)
        const allRecords = await AcademicRecord.find({ studentId });
        const totalGPA = allRecords.reduce((acc, curr) => acc + parseFloat(curr.cgpa), 0) / allRecords.length;

        const studentProfile = await Student.findOne({ userId: studentId });
        if (studentProfile) {
            studentProfile.cgpa = totalGPA.toFixed(2);

            // Sync to BOTH subjects (for backward compatibility) and semesters (for detailed view)
            const semesterNum = parseInt(semester.replace(/\D/g, '')) || 0;
            const semesterEntry = {
                semesterNumber: semesterNum,
                gpa: parseFloat(semesterGPA.toFixed(2)),
                subjects: subjects.map(s => ({
                    ...s,
                    grade: s.grade || 'N/A' // Ensure grade is present
                }))
            };

            const semesterIndex = studentProfile.semesters.findIndex(s => s.semesterNumber === semesterNum);
            if (semesterIndex > -1) {
                studentProfile.semesters[semesterIndex] = semesterEntry;
            } else {
                studentProfile.semesters.push(semesterEntry);
            }

            // Sync subjects to profile for simple viewing if needed
            const currentSubNames = studentProfile.subjects.map(s => s.name);
            subjects.forEach(sub => {
                if (!currentSubNames.includes(sub.name)) {
                    studentProfile.subjects.push(sub);
                }
            });

            await studentProfile.save();
        }

        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new student
// @route   POST /api/admin/create-student
// @access  Private/Admin
export const createStudent = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { name, email, department, password, advisorId, cgpa } = req.body;
    console.log("Creating user (student):", email);

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, msg: 'Email format invalid' });
    }
    if (password && password.length < 6) {
        return res.status(400).json({ success: false, msg: 'Password too short' });
    }
    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
        return res.status(400).json({ success: false, msg: 'CGPA must be between 0 and 10' });
    }

    try {
        console.log("Using collection:", User.collection.name);
        console.log("Incoming student data:", req.body);
        let user = await User.findOne({ email });
        if (user) {
            console.log("Student creation failed: User already exists");
            return res.status(400).json({ success: false, msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'student'
        });

        const savedUser = await user.save();
        console.log("User saved successfully:", savedUser._id);

        const studentProfile = new Student({
            userId: user.id,
            department: department || 'General',
            advisorId: advisorId || null,
            subjects: [],
            cgpa: cgpa || 0
        });

        await studentProfile.save();
        console.log("Student profile saved successfully:", studentProfile._id);
        
        // Clear caches
        cache.del('all_students');
        
        console.log("MongoDB operation completed successfully");

        res.json({
            success: true,
            msg: "Student created successfully",
            user
        });
    } catch (error) {
        console.error("User creation error:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

// @desc    Create a new advisor
// @route   POST /api/admin/create-advisor
// @access  Private/Admin
export const createAdvisor = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { name, email, department, password } = req.body;
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, msg: 'Email format invalid' });
    }
    if (password && password.length < 6) {
        return res.status(400).json({ success: false, msg: 'Password too short' });
    }

    try {
        console.log("Using collection:", User.collection.name);
        console.log("Incoming advisor data:", req.body);
        let user = await User.findOne({ email });
        if (user) {
            console.log("Advisor creation failed: User already exists");
            return res.status(400).json({ success: false, msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'advisor'
        });

        const savedUser = await user.save();
        console.log("User saved successfully:", savedUser._id);

        const advisorProfile = new Advisor({
            userId: user.id,
            department: department || 'General'
        });

        await advisorProfile.save();
        console.log("Advisor profile saved successfully:", advisorProfile._id);
        
        // Clear caches
        cache.del('all_advisors');
        
        console.log("MongoDB operation completed successfully");

        res.json({
            success: true,
            msg: "Advisor created successfully",
            user
        });
    } catch (error) {
        console.error("User creation error:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id OR /api/admin/students/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Deleting user ID:", req.params.id);
        const id = req.params.id;

        // Use findByIdAndDelete as requested
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        // Remove associated profile and records based on role
        if (user.role === 'student') {
            await Student.deleteOne({ userId: id });
            await AcademicRecord.deleteMany({ studentId: id });
            cache.del('all_students');
        } else if (user.role === 'advisor') {
            await Advisor.deleteOne({ userId: id });
            await Student.updateMany({ advisorId: id }, { $set: { advisorId: null } });
            cache.del('all_advisors');
        }

        console.log("User deleted successfully from all collections");
        cache.del(['all_students', 'all_advisors']); // Conservative clearing

        res.json({
            success: true,
            msg: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} record deleted successfully`
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            msg: "Server error during deletion"
        });
    }
};

// @desc    Update student details (including CGPA)
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
export const updateStudent = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { name, email, department, cgpa, advisorId } = req.body;

    // Validation
    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
        return res.status(400).json({ msg: 'CGPA must be between 0 and 10' });
    }

    try {
        console.log("Updating student:", req.params.id);
        
        // Use findByIdAndUpdate as requested
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { name, email } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Update Student Profile fields
        let studentProfile = await Student.findOneAndUpdate(
            { userId: req.params.id },
            { $set: { department, cgpa, advisorId } },
            { new: true }
        );

        // Clear caches to ensure dashboard reflects changes
        cache.del(['all_students', 'all_advisors']);
        console.log("Cache cleared for all_students and all_advisors");

        res.json({ 
            success: true, 
            msg: 'Student updated successfully', 
            user: updatedUser, 
            profile: studentProfile 
        });
    } catch (err) {
        console.error("Update student error:", err.message);
        res.status(500).json({ msg: 'Server Error during student update' });
    }
};

// @desc    Update advisor details
// @route   PUT /api/admin/advisor/:id
// @access  Private/Admin
export const updateAdvisor = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { name, email, department } = req.body;

    try {
        console.log("Updating advisor:", req.params.id);
        console.log("Using collection:", User.collection.name);
        let user = await User.findById(req.params.id);
        if (!user || user.role !== 'advisor') {
            return res.status(404).json({ msg: 'Advisor not found' });
        }

        // Update User fields
        if (name) user.name = name;
        if (email) user.email = email;
        await user.save();

        // Update Advisor Profile fields
        let advisorProfile = await Advisor.findOne({ userId: req.params.id });
        if (advisorProfile) {
            if (department) advisorProfile.department = department;
            await advisorProfile.save();
            console.log("Advisor profile updated successfully");
            console.log("MongoDB operation completed successfully");
        }

        res.json({ msg: 'Advisor updated successfully', user, profile: advisorProfile });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
