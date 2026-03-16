import mongoose from 'mongoose';

const AdvisorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    }
});

export default mongoose.model('Advisor', AdvisorSchema);
