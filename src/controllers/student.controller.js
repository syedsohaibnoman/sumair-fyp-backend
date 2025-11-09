import { isValidObjectId } from 'mongoose';
import { StudentModel } from '../models/student.model.js';
import { UserModel } from '../models/user.model.js';
import { handleMongooseValidation } from '../common/utils/mongooseValidator.js';


// ~ Add New Student ~
export const addStudent = async (request, response) => {
    try {
        const data = request?.body;
        const student = await StudentModel.create(data);
        const user = await studentAccount(student);

        student.userID = user._id;
        await student.save();

        response.status(201).json({ data: student });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) return response.status(422).json({ error: handleMongooseValidation(error, "Student") });

        console.log(error);
        response.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Get All Students ~
export const getStudents = async (request, response) => {
    try {
        const { search = "", sort = "fullName", order = "asc", page = 1, limit = 20, ...filters } = request.query;

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

        return response.status(200).json({
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
        return response.status(500).json({ message: "Something went wrong while fetching student records." });
    }
};


// ~ Get Single Student ~
export const getSingleStudent = async (request, response) => {
    try {
        const studentID = request.params.id;
        if (!isValidObjectId(studentID)) return response.status(400).json({ message: "Invalid MongoDB objectID" });

        const student = await StudentModel.findById(studentID);
        if (!student) return response.status(404).json({ message: "Student not found" });

        return response.status(200).json({ student });
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internal server error" });
    }
}


// ~ Update Student ~
export const updateStudent = async (request, response) => {
    try {
        const studentID = request.params.id;
        if (!isValidObjectId(studentID)) return response.status(400).json({ message: "Invalid MongoDB objectID" });

        const data = request.body;
        if (!data || Object.keys(data).length === 0) return response.status(400).json({ message: "Request body cannot be empty" });

        const student = await StudentModel.findById(studentID);
        if (!student) return response.status(404).json({ message: "Student not found" });

        const update = await StudentModel.findByIdAndUpdate(studentID, data, { new: true });
        return response.status(200).json({ student: update });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) return response.status(422).json({ error: handleMongooseValidation(error, "Student") });

        console.log(error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Delete Student ~
export const deleteStudent = async (request, response) => {
    try {
        const studentID = request.params.id;
        if (!isValidObjectId(studentID)) return response.status(400).json({ message: "Invalid MongoDB objectID" });

        const student = await StudentModel.findById(studentID);
        if (!student) return response.status(404).json({ message: "Student not found" });

        await UserModel.findByIdAndDelete(student.userID);
        await StudentModel.findByIdAndDelete(student._id);

        return response.status(200).json({ message: "Student Successfully Deleted" });
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Create Student's Account After Student Add ~
const studentAccount = async (student) => {
    try {
        const user = await UserModel.create({ fullName: student?.fullName, email: student?.email, password: student?.email });
        return user;
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
            return { error: handleMongooseValidation(error, "User") };
        }

        return { error: "Failed to create student account", details: error };
    }
}