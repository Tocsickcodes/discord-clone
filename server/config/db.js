const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            serverSelectionTimeoutMS: 3000
        });
        console.log(`MongoDB Connected: ${process.env.DATABASE_URI}`);
    } catch (err) {
        console.warn('Database Connection Error:', err.message);
        console.warn('No local MongoDB service detected. Switching to localized NeDB (File-based) storage for review.');

        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        // Set a global flag so models know to use the mock implementation
        global.USE_MOCK_DB = true;
    }
};

module.exports = connectDB;
