// ~ Database Config ~
import Connection from './src/config/db.config.js';

// ~ Dependencies ~
import express from 'express';
import csurf from '@dr.pogodin/csurf';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';
import httpErrors from 'http-errors';
import rateLimit from 'express-rate-limit';
import env from './src/common/constants/env.constants.js';

// ~ Routes ~
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import sessionRoutes from './src/routes/session.routes.js';
import formRoutes from './src/routes/form.routes.js';


Connection();
const app = express();

// ~ Global Middlewares ~
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, crossOriginOpenerPolicy: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


// ~ Rate Limiting (prevents brute-force, flagged by Snyk if missing) ~
app.use(rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP
	standardHeaders: true,
	legacyHeaders: false
}));


// ~ CSRF Protection Setup ~
const csrfProtection = csurf({ cookie: true });

app.get("/csrf-token", csrfProtection, (req, res) => res.json({ csrfToken: req.csrfToken() }));
app.use(csrfProtection);


// ~ Expose APIs ~
app.use('/api', [
	userRoutes,
	authRoutes,
	studentRoutes,
	sessionRoutes,
	formRoutes
]);


// ~ CSRF Error Handler ~
app.use((err, req, res, next) => {
	if (err.code === "EBADCSRFTOKEN") return res.status(403).json({ message: "Invalid or missing CSRF token" });
	res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});


// ~ Error Handler ~
app.use((req, res, next) => next(httpErrors(404)));
app.use((error, req, res, next) => res.status(error.status || 500).json({ message: error.message }));


// ~ Start Server ~
const server = app.listen(env.PORT, () => console.log(`Server running on PORT ${env.PORT}`));


// ~ Graceful Shutdown ~
process.on("SIGINT", async () => {
	console.log("Shutting down server...");
	server.close(() => {
		console.log("Server closed. Exiting process...");
		process.exit(0);
	});
});

process.on("unhandledRejection", (reason) => {
	console.log("Unhandled Promise Rejection:", reason);
});