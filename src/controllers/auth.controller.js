import { UserModel } from '../models/user.model.js';
import { handleMongooseValidation } from '../common/utils/mongooseValidator.js';
import { generateToken } from '../common/utils/jwt.js';
import env from '../common/constants/env.constants.js';


// ~ Register ~
export const register = async (req, res) => {
    try {
        const user = await UserModel.create(req?.body);
        res.status(201).json({ user });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return res.status(422).json({ error: handleMongooseValidation(error, "User") });
        }

        console.error(error);
        res.status(500).json({ error: "Failed to register" });
    }
}


// ~ Login ~
export const login = async (req, res) => {
    try {
        const { email, password } = req?.body;

        const user = await UserModel.findOne({ email });
        if (!user || !(await user.isPasswordMatched(password))) return res.status(400).json({ message: "Invalid Credentials" });

        const token = generateToken({ id: user._id });

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to login" });
    }
}


// ~ Logout ~
export const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({ message: "Logged out successfull" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to login" });
    }
}