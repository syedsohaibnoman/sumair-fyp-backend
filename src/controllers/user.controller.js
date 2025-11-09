import { isValidObjectId } from 'mongoose';
import { UserModel } from '../models/user.model.js';


export const getProfile = async (request, response) => {
    try {
        const userID = request?.user._id;
        if (!isValidObjectId(userID)) return response.status(400).json({ message: "Invalid MongoDB objectID" });
        const profile = await UserModel.findById(userID);
        return response.status(200).json({ profile });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Failed to fetch profile" });
    }
}