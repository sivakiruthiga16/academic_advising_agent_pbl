const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const registerUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existingUser = await User.findOne({ email: 'sivakiruthigatsk@gmail.com' });
        if (existingUser) {
            console.log('User already exists. Updating role and authType...');
            existingUser.role = 'admin';
            existingUser.authType = 'google';
            // Note: If it's a new google user, googleId will be set on first login
            await existingUser.save();
            console.log('User updated successfully');
        } else {
            const newUser = new User({
                name: 'Sivakiruthiga', // Default name
                email: 'sivakiruthigatsk@gmail.com',
                role: 'admin',
                authType: 'google'
            });
            await newUser.save();
            console.log('User created successfully');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error registering user:', err);
        process.exit(1);
    }
};

registerUser();
