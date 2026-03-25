import mongoose from 'mongoose';

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
    academicRecords: [
        {
            semester: { type: String, required: true },
            subjects: [
                {
                    name: { type: String, required: true },
                    marks: { type: Number, required: true },
                    grade: { type: String, default: 'N/A' }
                }
            ],
            cgpa: { type: Number, default: 0 },
            updatedAt: { type: Date, default: Date.now }
        }
    ],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Student', StudentSchema);
