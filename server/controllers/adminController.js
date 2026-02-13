const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Advisor = require('../models/Advisor');
const AcademicRecord = require('../models/AcademicRecord');

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');

        // Enhance with profile data including advisor
        const enhancedStudents = await Promise.all(students.map(async (user) => {
            const profile = await Student.findOne({ userId: user._id }).populate('advisorId', 'name email');
            return {
                ...user.toObject(),
                profile
            };
        }));

        res.json(enhancedStudents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all advisors
// @route   GET /api/admin/advisors
// @access  Private/Admin
exports.getAllAdvisors = async (req, res) => {
    try {
        const advisors = await User.find({ role: 'advisor' }).select('-password');

        // Enhance with profile data
        const enhancedAdvisors = await Promise.all(advisors.map(async (user) => {
            const profile = await Advisor.findOne({ userId: user._id });
            // Count assigned students
            const studentCount = await Student.countDocuments({ advisorId: user._id });
            return {
                ...user.toObject(),
                profile,
                studentCount
            };
        }));

        res.json(enhancedAdvisors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Assign advisor to student
// @route   POST /api/admin/assign-advisor
// @access  Private/Admin
exports.assignAdvisor = async (req, res) => {
    const { studentId, advisorId } = req.body;

    try {
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

        res.json({ msg: 'Advisor assigned successfully', student: studentProfile });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add or Update academic record
// @route   POST /api/admin/academic-records
// @access  Private/Admin
exports.addAcademicRecord = async (req, res) => {
    const { studentId, semester, subjects, cgpa: manualCgpa } = req.body;

    try {
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

        // Update Student Overall CGPA (Average of all semesters)
        const allRecords = await AcademicRecord.find({ studentId });
        const totalGPA = allRecords.reduce((acc, curr) => acc + parseFloat(curr.cgpa), 0) / allRecords.length;

        const studentProfile = await Student.findOne({ userId: studentId });
        if (studentProfile) {
            studentProfile.cgpa = totalGPA.toFixed(2);

            // Sync subjects to profile for simple viewing if needed
            // Only add subjects that aren't already there (simplified)
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
exports.createStudent = async (req, res) => {
    const { name, email, department, password, advisorId, cgpa } = req.body;

    // Validation
    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
        return res.status(400).json({ msg: 'CGPA must be between 0 and 10' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'student'
        });

        await user.save();

        const studentProfile = new Student({
            userId: user.id,
            department: department || 'General',
            advisorId: advisorId || null,
            subjects: [],
            cgpa: cgpa || 0
        });

        await studentProfile.save();

        res.json({ msg: 'Student created successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new advisor
// @route   POST /api/admin/create-advisor
// @access  Private/Admin
exports.createAdvisor = async (req, res) => {
    const { name, email, department, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'advisor'
        });

        await user.save();

        const advisorProfile = new Advisor({
            userId: user.id,
            department: department || 'General'
        });

        await advisorProfile.save();

        res.json({ msg: 'Advisor created successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Remove associated profile
        if (user.role === 'student') {
            await Student.findOneAndDelete({ userId: user.id });
            await AcademicRecord.deleteMany({ studentId: user.id });
            // await Appointment.deleteMany({ studentId: user.id }); // optional cleanup
            // await Remark.deleteMany({ studentId: user.id });
        } else if (user.role === 'advisor') {
            await Advisor.findOneAndDelete({ userId: user.id });
            // Should properly handle unassigning students here in real app
            await Student.updateMany({ advisorId: user.id }, { $set: { advisorId: null } });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update student details (including CGPA)
// @route   PUT /api/admin/student/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
    const { name, email, department, cgpa, advisorId } = req.body;

    // Validation
    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
        return res.status(400).json({ msg: 'CGPA must be between 0 and 10' });
    }

    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update User fields
        if (name) user.name = name;
        if (email) user.email = email;
        await user.save();

        // Update Student Profile fields
        let studentProfile = await Student.findOne({ userId: req.params.id });
        if (studentProfile) {
            if (department) studentProfile.department = department;
            if (cgpa !== undefined) studentProfile.cgpa = cgpa; // Allow setting to 0
            if (advisorId) studentProfile.advisorId = advisorId;
            await studentProfile.save();
        }

        res.json({ msg: 'Student updated successfully', user, profile: studentProfile });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update advisor details
// @route   PUT /api/admin/advisor/:id
// @access  Private/Admin
exports.updateAdvisor = async (req, res) => {
    const { name, email, department } = req.body;

    try {
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
        }

        res.json({ msg: 'Advisor updated successfully', user, profile: advisorProfile });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
