const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic_advising_agent');
        console.log('MongoDB Connected');

        const email = 'admin@agent.com';
        const password = 'Password123!';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User NOT found with email:', email);
            process.exit(1);
        }
        console.log('User found:', user.email, user.role);

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log('Password MATCHES');
        } else {
            console.log('Password does NOT match');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyLogin();
