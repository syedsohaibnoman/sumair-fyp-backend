import multer, { diskStorage } from 'multer';
import { extname, join } from 'path';
import fs from 'fs';


export const uploadFiles = (fields) => {
    const uploadDir = join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            try {
                const timestamp = Date.now();
                const random = Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname).toLowerCase();
                cb(null, `${timestamp}-${random}${ext}`);
            } catch (error) {
                cb(error, null);
            }
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP are allowed."));
    };

    const limits = {
        fileSize: 5 * 1024 * 1024, // 5 MB per file
    };

    return multer({ storage, fileFilter, limits }).fields(fields);
}