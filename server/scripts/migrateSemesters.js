import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from '../models/Student.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic_advising');
        console.log('Connected.');

        const students = await Student.find({});
        console.log(`Found ${students.length} students to migrate.`);

        for (const student of students) {
            console.log(`Migrating student: ${student.userId}`);
            
            // Map academicRecords to semesters if semesters is empty or needs update
            if (student.academicRecords && student.academicRecords.length > 0) {
                const newSemesters = student.academicRecords.map(record => ({
                    semesterNumber: parseInt(record.semester.replace(/\D/g, '')) || 0,
                    gpa: record.cgpa || 0,
                    subjects: record.subjects.map(sub => ({
                        name: sub.name,
                        marks: sub.marks,
                        grade: sub.grade || 'N/A'
                    }))
                }));

                student.semesters = newSemesters;
                await student.save();
                console.log(`Successfully migrated ${newSemesters.length} semesters for student ${student.userId}`);
            } else {
                console.log(`No academic records found for student ${student.userId}`);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed with error:', err);
        process.exit(1);
    }
};

migrate();
