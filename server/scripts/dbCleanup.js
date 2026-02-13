const mongoose = require('mongoose');
const dotenv = require('dotenv');

const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic_advising_agent');
        console.log('MongoDB Connected for Cleanup');

        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            await collection.deleteMany({});
            console.log(`Cleared collection: ${collection.collectionName}`);
        }

        console.log('Database cleanup complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
