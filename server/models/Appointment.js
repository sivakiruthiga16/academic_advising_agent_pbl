import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    advisorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    advisorViewed: {
        type: Boolean,
        default: false
    },
    studentViewed: {
        type: Boolean,
        default: false
    },
    statusUpdatedAt: {
        type: Date,
        default: Date.now
    },
    advisorViewedAt: {
        type: Date
    },
    studentViewedAt: {
        type: Date
    }
});

export default mongoose.model('Appointment', AppointmentSchema);
