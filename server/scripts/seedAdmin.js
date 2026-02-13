const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic_advising_agent');
        console.log('MongoDB Connected for Seeding Admin');

        // Check if admin already exists
        let admin = await User.findOne({ email: 'admin@agent.com' });
        if (admin) {
            console.log('Admin already exists');
            process.exit();
        }

        // Create Admin
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('Password123!', salt);

        admin = new User({
            name: 'System Admin',
            email: 'admin@agent.com',
            password: password,
            role: 'admin',
            department: 'Administration'
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@agent.com');
        console.log('Password: Password123!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
