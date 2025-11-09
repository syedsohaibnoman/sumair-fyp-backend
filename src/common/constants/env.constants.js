import { config } from 'dotenv';

config();

const envConstants = {
    BASEURL: process.env.BASEURL,
    PORT: process.env.PORT,
    DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING,
    JWT_SECRET: process.env.JWT_SECRET
}

export default envConstants;