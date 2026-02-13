const Student = require('../models/Student');
const Remark = require('../models/Remark');
const User = require('../models/User');
const AcademicRecord = require('../models/AcademicRecord');

// @route   POST api/academic/remark
// @desc    Add Advisor Remark
// @access  Private (Advisor/Admin)
exports.addRemark = async (req, res) => {
    const { studentId, remark: remarkText } = req.body;

    try {
        const remark = new Remark({
            advisorId: req.user.user.id,
            studentId,
            remark: remarkText
        });

        await remark.save();
        res.json(remark);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/academic/suggestions/:studentId
// @desc    Get AI-based improvement suggestions
// @access  Private
exports.getSuggestions = async (req, res) => {
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
exports.getRemarks = async (req, res) => {
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
exports.upsertRecord = async (req, res) => {
    const { studentId, semester, subjects } = req.body;

    try {
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
exports.getRecords = async (req, res) => {
    try {
        const records = await AcademicRecord.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
