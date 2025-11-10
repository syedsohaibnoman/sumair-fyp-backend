// ~ Database Config ~
import './src/config/db.config.js';

// ~ Dependencies ~
import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import httpErrors from 'http-errors';
import env from './src/common/constants/env.constants.js';

// ~ Routes ~
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import sessionRoutes from './src/routes/session.routes.js';
import formRoutes from './src/routes/form.routes.js';


const app = express();

// ~ Global Middlewares ~
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


// ~ Uploads Handler ~
app.use("/uploads", (request, response, next) => {
	response.header("Access-Control-Allow-Origin", "http://localhost:5173");
	response.header("Access-Control-Allow-Credentials", "true");
	next();
});


// ~ Expose APIs ~
app.use('/api', [
	userRoutes,
	authRoutes,
	studentRoutes,
	sessionRoutes,
	formRoutes
]);


// ~ Error Handler ~
app.use((request, response, next) => next(httpErrors(404)));
app.use((error, request, response, next) => response.status(error.status || 500).json({ status: error.status || 500, message: error.message }));


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