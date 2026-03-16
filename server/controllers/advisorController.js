import Student from '../models/Student.js';
import Remark from '../models/Remark.js';
import Appointment from '../models/Appointment.js';
import AcademicRecord from '../models/AcademicRecord.js';

// @desc    Get assigned students
// @route   GET /api/advisor/students
// @access  Private/Advisor
export const getAssignedStudents = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Fetching assigned students for advisor:", req.user.user.id);
        console.log("Using collection:", Student.collection.name);
        const students = await Student.find({ advisorId: req.user.user.id })
            .populate('userId', 'name email')
            .populate('advisorId', 'name email');
        console.log("MongoDB operation completed successfully");
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add remark to student
// @route   POST /api/advisor/remarks
// @access  Private/Advisor
export const addRemark = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { studentId, content } = req.body;

    try {
        console.log("Adding remark for student:", studentId);
        console.log("Using collection:", Remark.collection.name);
        // Verify student is assigned to this advisor
        const student = await Student.findOne({ userId: studentId, advisorId: req.user.user.id });
        if (!student) {
            return res.status(401).json({ msg: 'Not authorized to add remarks for this student' });
        }

        const newRemark = new Remark({
            studentId,
            advisorId: req.user.user.id,
            content
        });

        await newRemark.save();
        console.log("Remark saved successfully:", newRemark._id);
        console.log("MongoDB operation completed successfully");
        res.json(newRemark);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get appointments for advisor
// @route   GET /api/advisor/appointments
// @access  Private/Advisor
export const getAppointments = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Fetching appointments for advisor:", req.user.user.id);
        console.log("Using collection:", Appointment.collection.name);
        const appointments = await Appointment.find({ advisorId: req.user.user.id })
            .populate('studentId', 'name email')
            .sort({ date: 1 });
        console.log("MongoDB operation completed successfully");
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update appointment status
// @route   PUT /api/advisor/appointments/:id
// @access  Private/Advisor
export const updateAppointmentStatus = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { status } = req.body;

    try {
        console.log("Updating appointment status for appointment ID:", req.params.id);
        console.log("Using collection:", Appointment.collection.name);
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        // Verify ownership
        if (appointment.advisorId.toString() !== req.user.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        appointment.status = status;
        await appointment.save();
        console.log("Appointment status updated successfully");
        console.log("MongoDB operation completed successfully");

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get student academic records
// @route   GET /api/advisor/student/:studentId/records
// @access  Private/Advisor
export const getStudentRecords = async (req, res) => {
    try {
        // Verify assignment
        const student = await Student.findOne({ userId: req.params.studentId, advisorId: req.user.user.id });
        if (!student) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const records = await AcademicRecord.find({ studentId: req.params.studentId }).sort({ semester: 1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
