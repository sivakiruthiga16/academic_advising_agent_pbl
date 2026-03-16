import Student from '../models/Student.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Remark from '../models/Remark.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private/Student
export const getProfile = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Fetching profile for student:", req.user.user.id);
        console.log("Using collection:", Student.collection.name);
        const studentProfile = await Student.findOne({ userId: req.user.user.id })
            .populate('userId', 'name email')
            .populate('advisorId', 'name email');
        console.log("MongoDB operation completed successfully");

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
export const getAcademicRecords = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Fetching academic records for student:", req.user.user.id);
        console.log("Using collection:", AcademicRecord.collection.name);
        const records = await AcademicRecord.find({ studentId: req.user.user.id })
            .sort({ semester: 1 });
        console.log("MongoDB operation completed successfully");
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get advisor remarks
// @route   GET /api/student/remarks
// @access  Private/Student
export const getRemarks = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Fetching advisor remarks for student:", req.user.user.id);
        console.log("Using collection:", Remark.collection.name);
        const remarks = await Remark.find({ studentId: req.user.user.id })
            .populate('advisorId', 'name')
            .sort({ createdAt: -1 });
        console.log("MongoDB operation completed successfully");
        res.json(remarks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Book appointment
// @route   POST /api/student/appointments
// @access  Private/Student
export const bookAppointment = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { advisorId, date, time, reason } = req.body;

    try {
        console.log("Booking appointment for student:", req.user.user.id);
        console.log("Using collection:", Appointment.collection.name);
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
        console.log("Appointment booked successfully");
        console.log("MongoDB operation completed successfully");
        res.json(newAppointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get my appointments
// @route   GET /api/student/appointments
// @access  Private/Student
export const getMyAppointments = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Fetching appointments for student:", req.user.user.id);
        console.log("Using collection:", Appointment.collection.name);
        const appointments = await Appointment.find({ studentId: req.user.user.id })
            .populate('advisorId', 'name')
            .sort({ date: 1 });
        console.log("MongoDB operation completed successfully");
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
