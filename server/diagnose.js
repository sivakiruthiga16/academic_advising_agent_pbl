import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Student from './models/Student.js';
import Advisor from './models/Advisor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const allUsers = await User.find({});
        console.log('--- All Users (%d) ---', allUsers.length);
        allUsers.forEach(u => {
            console.log(`- ${u.email} [Role: ${u.role}] [ID: ${u._id}]`);
        });

        const students = await Student.find({}).populate('userId');
        console.log('--- Student Profiles (%d) ---', students.length);
        students.forEach(s => {
            console.log(`- Student ID: ${s._id}, User: ${s.userId?.email || 'MISSING USER'}`);
        });

        const advisors = await Advisor.find({}).populate('userId');
        console.log('--- Advisor Profiles (%d) ---', advisors.length);
        advisors.forEach(a => {
            console.log(`- Advisor ID: ${a._id}, User: ${a.userId?.email || 'MISSING USER'}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Diagnostic error:', err);
    }
}

checkData();
