const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    advisorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    subjects: [
        {
            name: { type: String, required: true },
            marks: { type: Number, default: 0 },
            grade: { type: String, default: 'N/A' }
        }
    ],
    cgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', StudentSchema);
