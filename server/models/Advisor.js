const mongoose = require('mongoose');

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

module.exports = mongoose.model('Advisor', AdvisorSchema);
