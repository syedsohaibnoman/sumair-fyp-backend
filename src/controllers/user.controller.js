import { isValidObjectId } from 'mongoose';
import { UserModel } from '../models/user.model.js';
import env from '../common/constants/env.constants.js';


// ~ Get Profile ~
export const getProfile = async (req, res) => {
    try {
        const userID = req?.user._id;
        if (!isValidObjectId(userID)) return res.status(400).json({ message: "Invalid user ID" });

        const profile = await UserModel.findById(userID).select("-password");
        if (!profile) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "strict"
            });

            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json({ profile });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch profile" });
    }
}