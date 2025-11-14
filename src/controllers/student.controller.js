import { isValidObjectId } from 'mongoose';
import { StudentModel } from '../models/student.model.js';
import { UserModel } from '../models/user.model.js';
import { handleMongooseValidation } from '../common/utils/mongooseValidator.js';


// ~ Add New Student ~
export const addStudent = async (req, res) => {
    try {
        const student = await StudentModel.create(req?.body);
        const user = await studentAccount(student);

        student.userID = user._id;
        await student.save();

        res.status(201).json({ student });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return res.status(422).json({ error: handleMongooseValidation(error, "Student") })
        };

        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Get All Students ~
export const getStudents = async (req, res) => {
    try {
        const { search = "", sort = "fullName", order = "asc", page = 1, limit = 20, ...filters } = req.query;

        // Whitelist fields allowed for sorting (prevents query abuse)
        const allowedSortFields = ["fullName", "batch", "createdAt"];
        const sortField = allowedSortFields.includes(sort) ? sort : "fullName";
        const sortOrder = order === "desc" ? -1 : 1;

        // Sanitize and normalize pagination
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

        // Build query
        const query = {};
        if (search.trim()) {
            query.fullName = { $regex: search.trim(), $options: "i" };
        }

        // Merge additional filters but only allow specific keys
        const allowedFilters = ["batch", "gender"];
        for (const key in filters) {
            if (allowedFilters.includes(key)) query[key] = filters[key];
        }

        // Fetch data with pagination
        const students = await StudentModel.find(query).sort({ [sortField]: sortOrder }).skip((pageNum - 1) * limitNum).limit(limitNum).lean().exec();
        const total = await StudentModel.countDocuments(query);

        return res.status(200).json({
            students,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: "Something went wrong while fetching student records." });
    }
};


// ~ Get Single Student ~
export const getSingleStudent = async (req, res) => {
    try {
        const studentID = req.params.id;
        if (!isValidObjectId(studentID)) return res.status(400).json({ message: "Invalid student ID" });

        const single = await StudentModel.findById(studentID);
        if (!single) return res.status(404).json({ message: "Student not found" });

        return res.status(200).json({ student: single });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


// ~ Update Student ~
export const updateStudent = async (req, res) => {
    try {
        const studentID = req.params.id;
        if (!isValidObjectId(studentID)) return res.status(400).json({ message: "Invalid student ID" });

        const data = req.body;
        if (!data || Object.keys(data).length === 0) return res.status(400).json({ message: "req body cannot be empty" });

        const student = await StudentModel.findById(studentID);
        if (!student) return res.status(404).json({ message: "Student not found" });

        const updated = await StudentModel.findByIdAndUpdate(studentID, data, { new: true });
        return res.status(200).json({ student: updated });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return res.status(422).json({ error: handleMongooseValidation(error, "Student") })
        };

        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Delete Student ~
export const deleteStudent = async (req, res) => {
    try {
        const studentID = req.params.id;
        if (!isValidObjectId(studentID)) return res.status(400).json({ message: "Invalid student ID" });

        const student = await StudentModel.findById(studentID);
        if (!student) return res.status(404).json({ message: "Student not found" });

        await UserModel.findByIdAndDelete(student.userID);
        await StudentModel.findByIdAndDelete(student._id);

        return res.status(200).json({ message: "Student successfully deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Create Student's Account After Student Add ~
const studentAccount = async (student) => {
    try {
        const user = await UserModel.create({ fullName: student?.fullName, email: student?.email, password: student?.email });
        return user;
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return { error: handleMongooseValidation(error, "User") };
        }

        return { error: "Failed to create student account", details: error };
    }
}