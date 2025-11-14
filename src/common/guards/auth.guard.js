import { UserModel } from '../../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';

export const authGuard = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) return res.status(401).json({ message: "Authorization token is missing" });

        const decoded = verifyToken(token);
        if (!decoded?.id) return res.status(401).json({ message: "Invalid token payload" });

        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        req['user'] = user;
        return next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") return res.status(401).json({ message: "Invalid token format" });
        if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Token has expired" });

        console.error('Auth guard error', error);
        res.status(500).json({ message: "Internal server error" });
    }
}