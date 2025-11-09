export const roleGuard = (role) => {
    return function (request, response, next) {
        try {
            if (role === request?.user.role) return next();
            response.status(403).json({ message: "Forbidden. You don't have permission to access this resource" });
        } catch (error) {
            response.status(500).json({ message: error.message });
        }
    };
}