const Student = require('../models/Student');
const AcademicRecord = require('../models/AcademicRecord');
const Remark = require('../models/Remark');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private/Student
exports.getProfile = async (req, res) => {
    try {
        const studentProfile = await Student.findOne({ userId: req.user.user.id })
            .populate('userId', 'name email')
            .populate('advisorId', 'name email');

        if (!studentProfile) {
            return res.status(404).json({ msg: 'Student profile not found' });
        }

        res.json(studentProfile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get academic records
// @route   GET /api/student/records
// @access  Private/Student
exports.getAcademicRecords = async (req, res) => {
    try {
        const records = await AcademicRecord.find({ studentId: req.user.user.id })
            .sort({ semester: 1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get advisor remarks
// @route   GET /api/student/remarks
// @access  Private/Student
exports.getRemarks = async (req, res) => {
    try {
        const remarks = await Remark.find({ studentId: req.user.user.id })
            .populate('advisorId', 'name')
            .sort({ createdAt: -1 });
        res.json(remarks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Book appointment
// @route   POST /api/student/appointments
// @access  Private/Student
exports.bookAppointment = async (req, res) => {
    const { advisorId, date, time, reason } = req.body;

    try {
        const studentProfile = await Student.findOne({ userId: req.user.user.id });
        if (!studentProfile || !studentProfile.advisorId) {
            return res.status(400).json({ msg: 'No advisor assigned to book appointment with' });
        }

        if (studentProfile.advisorId.toString() !== advisorId) {
            return res.status(401).json({ msg: 'Can only book with assigned advisor' });
        }

        const newAppointment = new Appointment({
            studentId: req.user.user.id,
            advisorId,
            date,
            time,
            reason
        });

        await newAppointment.save();
        res.json(newAppointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get my appointments
// @route   GET /api/student/appointments
// @access  Private/Student
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ studentId: req.user.user.id })
            .populate('advisorId', 'name')
            .sort({ date: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
