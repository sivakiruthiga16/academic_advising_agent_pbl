const mongoose = require('mongoose');

const AcademicRecordSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    subjects: [
        {
            name: { type: String, required: true },
            marks: { type: Number, required: true },
            grade: { type: String, default: 'N/A' }
        }
    ],
    cgpa: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AcademicRecord', AcademicRecordSchema);
