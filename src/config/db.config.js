import mongoose from 'mongoose';
import env from '../common/constants/env.constants.js';

const Connection = async () => {
    try {
        await mongoose.connect(env.DATABASE_CONNECTION_STRING);
        console.log("Connection to Database is Established");
    } catch (error) {
        console.log("Connection Failed", error);
    }
};

export default Connection();