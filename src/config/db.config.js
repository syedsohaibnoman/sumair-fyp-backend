import mongoose from 'mongoose';
import env from '../common/constants/env.constants.js';


async function connectDB() {
    try {
        await mongoose.connect(env.DATABASE_CONNECTION_STRING, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
});


export default connectDB;