import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import mongoose from 'mongoose';

// @route   POST api/appointments
// @desc    Book an appointment (Student)
// @access  Private (Student)
export const bookAppointment = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { advisorId, date, time, reason } = req.body;
    try {
        console.log("Creating appointment for student:", req.user.user.id);
        console.log("Using collection:", Appointment.collection.name);
        const student = await Student.findOne({ userId: req.user.user.id });
        if (!student) return res.status(404).json({ msg: 'Student profile not found' });

        // Verify advisor exists
        const advisor = await User.findById(advisorId);
        if (!advisor || advisor.role !== 'advisor') {
            return res.status(400).json({ msg: 'Invalid advisor' });
        }

        const newAppointment = new Appointment({
            studentId: req.user.user.id, // User ID
            advisorId,
            date,
            time,
            reason,
            advisorViewed: false, // Explicitly set for notification trigger
        });

        const appointment = await newAppointment.save();
        console.log("Appointment saved successfully:", appointment._id);
        console.log("MongoDB operation completed successfully");
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/appointments
// @desc    Get appointments for current user (Student/Advisor/Admin)
// @access  Private
export const getAppointments = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        let appointments;
        const userId = req.user.user.id;
        const role = req.user.user.role;
        console.log(`Fetching appointments for ${role}:`, userId);
        console.log("Using collection:", Appointment.collection.name);

        if (role === 'student') {
            appointments = await Appointment.find({ studentId: userId })
                .populate('advisorId', 'name email')
                .populate('studentId', 'name email')
                .sort({ date: 1 });
        } else if (role === 'advisor') {
            appointments = await Appointment.find({ advisorId: userId })
                .populate('studentId', 'name email')
                .populate('advisorId', 'name email')
                .sort({ date: 1 });
        } else if (role === 'admin') {
            appointments = await Appointment.find()
                .populate('studentId', 'name email')
                .populate('advisorId', 'name email')
                .sort({ date: 1 });
        } else {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Note: We removed the auto-mark-viewed logic from here to separate concerns.
        // It is now handled by markNotificationsViewed endpoint.

        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/appointments/:id
// @desc    Update appointment status (Advisor/Admin)
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { status } = req.body;

    try {
        console.log("Updating appointment status for ID:", req.params.id);
        console.log("Using collection:", Appointment.collection.name);
        let appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        // Ensure authorized (Advisor or Admin)
        if (req.user.user.role !== 'admin' && appointment.advisorId.toString() !== req.user.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        appointment.status = status;
        appointment.studentViewed = false;
        appointment.statusUpdatedAt = Date.now();
        await appointment.save();
        console.log("Appointment status updated successfully");
        console.log("MongoDB operation completed successfully");

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/appointments/:id
// @desc    Delete appointment
// @access  Private (Admin)
export const deleteAppointment = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Deleting appointment ID:", req.params.id);
        const id = new mongoose.Types.ObjectId(req.params.id);

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ success: false, msg: 'Appointment not found' });
        }

        // Ensure authorized (Admin only)
        if (req.user.user.role !== 'admin') {
            return res.status(401).json({ success: false, msg: 'Not authorized' });
        }

        console.log("Using collection:", Appointment.collection.name);
        const result = await Appointment.deleteOne({ _id: id });
        console.log("Delete result:", result);
        console.log("MongoDB operation completed successfully");

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                msg: "Appointment not found"
            });
        }

        res.json({
            success: true,
            msg: "Appointment deleted successfully"
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
};
// @route   GET api/appointments/notifications
// @desc    Get notification counts (supports /advisor/:id and /student/:id)
// @access  Private
export const getNotificationCounts = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const role = req.user.user.role;

        // Optional: specific ID check if params are used, though userId from token is safest source of truth
        const paramId = req.params.advisorId || req.params.studentId;
        if (paramId && paramId !== userId) {
            return res.status(401).json({ msg: 'Unauthorized access to notifications' });
        }

        let count = 0;

        if (role === 'advisor') {
            count = await Appointment.countDocuments({
                advisorId: userId,
                status: 'pending',
                advisorViewed: false
            });
        } else if (role === 'student') {
            count = await Appointment.countDocuments({
                studentId: userId,
                status: { $in: ['approved', 'rejected'] },
                studentViewed: false
            });
        }

        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/appointments/notifications/mark-viewed
// @desc    Mark notifications as viewed
// @access  Private
export const markNotificationsViewed = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const role = req.user.user.role;

        if (role === 'advisor') {
            await Appointment.updateMany(
                { advisorId: userId, status: 'pending', advisorViewed: false },
                { $set: { advisorViewed: true, advisorViewedAt: Date.now() } }
            );
        } else if (role === 'student') {
            await Appointment.updateMany(
                { studentId: userId, status: { $in: ['approved', 'rejected'] }, studentViewed: false },
                { $set: { studentViewed: true, studentViewedAt: Date.now() } }
            );
        }

        res.json({ msg: 'Notifications marked as viewed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
