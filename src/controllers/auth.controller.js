import { UserModel } from '../models/user.model.js';
import { handleMongooseValidation } from '../common/utils/mongooseValidator.js';
import { generateToken } from '../common/utils/jwt.js';


export const register = async (request, response) => {
    try {
        const user = await UserModel.create(request?.body);
        response.status(201).json({ user });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
            return response.status(422).json({ error: handleMongooseValidation(error, "User") });
        }

        console.log(error);
        response.status(500).json({ error: "Failed to register" });
    }
}


export const login = async (request, response) => {
    try {
        const { email, password } = request?.body;

        const user = await UserModel.findOne({ email });
        if (!user || !(await user.isPasswordMatched(password))) return response.status(400).json({ message: "Invalid Credentials" });

        const token = generateToken({ id: user._id });
        response.cookie("accessToken", token, { httpOnly: false, maxAge: 24 * 60 * 60 * 1000, sameSite: "lax" });
        return response.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: "Failed to login" });
    }
}