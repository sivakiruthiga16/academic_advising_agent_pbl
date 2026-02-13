const Student = require('../models/Student');
const Remark = require('../models/Remark');
const Appointment = require('../models/Appointment');
const AcademicRecord = require('../models/AcademicRecord');

// @desc    Get assigned students
// @route   GET /api/advisor/students
// @access  Private/Advisor
exports.getAssignedStudents = async (req, res) => {
    try {
        const students = await Student.find({ advisorId: req.user.user.id })
            .populate('userId', 'name email')
            .populate('advisorId', 'name email');

        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add remark to student
// @route   POST /api/advisor/remarks
// @access  Private/Advisor
exports.addRemark = async (req, res) => {
    const { studentId, content } = req.body;

    try {
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
        res.json(newRemark);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get appointments for advisor
// @route   GET /api/advisor/appointments
// @access  Private/Advisor
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ advisorId: req.user.user.id })
            .populate('studentId', 'name email')
            .sort({ date: 1 });

        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update appointment status
// @route   PUT /api/advisor/appointments/:id
// @access  Private/Advisor
exports.updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;

    try {
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

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get student academic records
// @route   GET /api/advisor/student/:studentId/records
// @access  Private/Advisor
exports.getStudentRecords = async (req, res) => {
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
