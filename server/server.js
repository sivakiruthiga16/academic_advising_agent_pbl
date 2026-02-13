const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic_advising_agent')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
mongoose.connection.once("open", () => {
    console.log("Connected DB:", mongoose.connection.name);
});


// Routes (will be imported later)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/advisor', require('./routes/advisorRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
