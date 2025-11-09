import multer, { diskStorage } from "multer";
import { extname } from "path";

export function uploadFiles(fields) {
    const storage = diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/");
        },
        filename: (req, file, cb) => {
            try {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const ext = extname(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            } catch (error) {
                cb(error, false);
            }
        }
    });

    return multer({ storage }).fields(fields);
}