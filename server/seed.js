const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('./models/User');
const Student = require('./models/Student');
const Advisor = require('./models/Advisor');
const AcademicRecord = require('./models/AcademicRecord');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data (already handled by cleanup, but safe to do again for models)
        await User.deleteMany({});
        await Student.deleteMany({});
        await Advisor.deleteMany({});
        await AcademicRecord.deleteMany({});

        const salt = await bcrypt.genSalt(10);

        // 1. Create Admin
        const adminPassword = await bcrypt.hash('admin123', salt);
        const admin = new User({
            name: 'System Admin',
            email: 'admin@university.edu',
            password: adminPassword,
            role: 'admin'
        });
        await admin.save();
        console.log('Admin created');

        // 2. Create Advisor
        const advisorPassword = await bcrypt.hash('advisor123', salt);
        const advisorUser = new User({
            name: 'Dr. Smith',
            email: 'smith@university.edu',
            password: advisorPassword,
            role: 'advisor'
        });
        await advisorUser.save();

        const advisorProfile = new Advisor({
            userId: advisorUser._id,
            department: 'Computer Science'
        });
        await advisorProfile.save();
        console.log('Advisor created');

        // 3. Create Student
        const studentPassword = await bcrypt.hash('student123', salt);
        const studentUser = new User({
            name: 'John Doe',
            email: 'john@university.edu',
            password: studentPassword,
            role: 'student'
        });
        await studentUser.save();

        const studentProfile = new Student({
            userId: studentUser._id,
            department: 'Computer Science',
            advisorId: advisorUser._id,
            cgpa: 8.1,
            subjects: [
                { name: 'Math', marks: 80, grade: 'A' },
                { name: 'DSA', marks: 75, grade: 'B' }
            ]
        });
        await studentProfile.save();
        console.log('Student Profile created and assigned to Smith');

        // 4. Create Academic Record for Student
        const academicRecord = new AcademicRecord({
            studentId: studentUser._id,
            semester: 'Fall 2025',
            subjects: [
                { subjectName: 'Math', marks: 80, grade: 'A' },
                { subjectName: 'DSA', marks: 75, grade: 'B' }
            ],
            cgpa: 8.1,
            remarks: 'Strong start in core subjects.'
        });
        await academicRecord.save();
        console.log('Academic Record created for John Doe');

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
};

seedDatabase();
