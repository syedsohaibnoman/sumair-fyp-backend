import { UserModel } from '../../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';

export const authGuard = async (request, response, next) => {
    try {
        const header = request.headers.authorization;
        if (!header) return response.status(401).json({ message: "Authorization header is missing" });

        const [scheme, token] = header.split(' ');
        if (scheme !== 'Bearer' || !token) return response.status(401).json({ message: "Invalid or missing token" });

        const decoded = verifyToken(token);
        if (!decoded?.id) return response.status(401).json({ message: "Invalid token payload" });

        const user = await UserModel.findById(decoded.id);
        if (!user) return response.status(404).json({ message: "User not found" });

        request['user'] = user;
        return next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") return response.status(401).json({ message: "Invalid token format" });
        if (error.name === "TokenExpiredError") return response.status(401).json({ message: "Token has expired" });

        console.log('Auth guard error', error);
        response.status(500).json({ message: "Internal server error" });
    }
}