import Student from '../models/Student.js';
import Remark from '../models/Remark.js';
import User from '../models/User.js';
import AcademicRecord from '../models/AcademicRecord.js';
import mongoose from 'mongoose';

// @route   POST api/academic/remark
// @desc    Add Advisor Remark
// @access  Private (Advisor/Admin)
export const addRemark = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { studentId, remark: remarkText } = req.body;
    try {
        console.log("Adding remark for student:", studentId);
        console.log("Using collection:", Remark.collection.name);
        const remark = new Remark({
            advisorId: req.user.user.id,
            studentId,
            remark: remarkText
        });

        await remark.save();
        console.log("MongoDB operation completed successfully");
        res.json(remark);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/academic/suggestions/:studentId
// @desc    Get AI-based improvement suggestions
// @access  Private
export const getSuggestions = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        const student = await Student.findOne({ userId: req.params.studentId });
        if (!student) return res.status(404).json({ msg: 'Student not found' });

        const suggestions = student.subjects.map(subject => {
            if (subject.marks < 50) {
                return { subject: subject.name, suggestion: "Focus more on this subject - review basic concepts." };
            } else if (subject.marks < 75) {
                return { subject: subject.name, suggestion: "Good progress, but practice more advanced problems." };
            } else {
                return { subject: subject.name, suggestion: "Excellent! Keep maintaining this level." };
            }
        });

        res.json(suggestions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/academic/remarks/:studentId
// @desc    Get advisor remarks for a student
// @access  Private
export const getRemarks = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        const remarks = await Remark.find({ studentId: req.params.studentId })
            .populate('advisorId', 'name')
            .sort({ createdAt: -1 });
        res.json(remarks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/academic/records
// @desc    Add or Update Academic Record
// @access  Private (Admin)
export const upsertRecord = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { studentId, semester, subjects } = req.body;

    try {
        console.log("Updating/Upserting academic record for student:", studentId);
        console.log("Using collection:", AcademicRecord.collection.name);
        let record = await AcademicRecord.findOne({ studentId, semester });

        if (record) {
            record.subjects = subjects;
            record.updatedAt = Date.now();
        } else {
            record = new AcademicRecord({
                studentId,
                semester,
                subjects
            });
        }

        await record.save();
        console.log("MongoDB operation completed successfully");

        // Also update the main Student profile's CGPA for quick display
        await Student.findOneAndUpdate(
            { userId: studentId },
            { cgpa: record.cgpa },
            { new: true }
        );

        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/academic/records/:studentId
// @desc    Get all academic records for a student
// @access  Private
export const getRecords = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Fetching academic records for student:", req.params.studentId);
        console.log("Using collection:", AcademicRecord.collection.name);
        const records = await AcademicRecord.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
        console.log("MongoDB operation completed successfully");
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// @route   DELETE api/academic/records/:id
// @desc    Delete academic record
// @access  Private (Admin)
export const deleteRecord = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Deleting academic record ID:", req.params.id);
        const id = new mongoose.Types.ObjectId(req.params.id);

        const record = await AcademicRecord.findById(id);
        if (!record) {
            return res.status(404).json({ success: false, msg: 'Record not found' });
        }

        const studentId = record.studentId;
        console.log("Using collection:", AcademicRecord.collection.name);
        const result = await AcademicRecord.deleteOne({ _id: id });
        console.log("Delete result:", result);
        console.log("MongoDB operation completed successfully");

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                msg: "Record not found"
            });
        }

        // Recalculate Overall CGPA
        const allRecords = await AcademicRecord.find({ studentId });
        let totalGPA = 0;
        if (allRecords.length > 0) {
            totalGPA = allRecords.reduce((acc, curr) => acc + parseFloat(curr.cgpa), 0) / allRecords.length;
        }

        await Student.findOneAndUpdate(
            { userId: studentId },
            { cgpa: totalGPA.toFixed(2) }
        );

        res.json({
            success: true,
            msg: "Record deleted successfully",
            cgpa: totalGPA.toFixed(2)
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
};

// @route   DELETE api/academic/remark/:id
// @desc    Delete advisor remark
// @access  Private (Advisor/Admin)
export const deleteRemark = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Deleting advisor remark ID:", req.params.id);
        const id = new mongoose.Types.ObjectId(req.params.id);

        const remark = await Remark.findById(id);
        if (!remark) {
            return res.status(404).json({ success: false, msg: 'Remark not found' });
        }

        // Authorization check: Admin or the Advisor who created it
        if (req.user.user.role !== 'admin' && remark.advisorId.toString() !== req.user.user.id) {
            return res.status(401).json({ success: false, msg: 'Not authorized' });
        }

        console.log("Using collection:", Remark.collection.name);
        const result = await Remark.deleteOne({ _id: id });
        console.log("Delete result:", result);
        console.log("MongoDB operation completed successfully");

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                msg: "Remark not found"
            });
        }

        res.json({
            success: true,
            msg: "Remark deleted successfully"
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
};
