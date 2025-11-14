export const roleGuard = (allowedRoles = ["admin", "student"]) => {
    return (req, res, next) => {
        try {
            const userRole = req?.user?.role;

            if (!userRole) return res.status(401).json({ message: "Unauthorized: User role missing" });
            if (!allowedRoles.includes(userRole)) return res.status(403).json({ message: "Forbidden: You don't have permission to access this resource" });

            next();
        } catch (error) {
            console.error("Role guard error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };
};