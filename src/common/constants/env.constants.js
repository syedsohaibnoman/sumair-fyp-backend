import { config } from 'dotenv';
import path from 'path';


config({ path: path.resolve(process.cwd(), ".env") });

const requiredEnvVars = [
    "PORT",
    "DATABASE_CONNECTION_STRING",
    "JWT_SECRET",
];

for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        console.log(`Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

const env = {
    BASE_URL: process.env.BASE_URL || "http://localhost:4000",
    PORT: parseInt(process.env.PORT, 10) || 4000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING,
    JWT_SECRET: process.env.JWT_SECRET,
};


export default env;