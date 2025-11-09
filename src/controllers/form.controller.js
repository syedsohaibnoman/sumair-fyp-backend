import { FormModel } from '../models/form.model.js';
import { handleMongooseValidation } from '../common/utils/mongooseValidator.js';
import envConstants from '../common/constants/env.constants.js';


export const addForm = async (request, response) => {
    try {
        const { files, body } = request;
        const data = { ...body };

        const fileFields = [
            'profilePicture',
            'anualChallan',
            'universityIdCard',
            'paymentReceipt'
        ];

        for (const field of fileFields) {
            const file = files?.[field]?.[0];
            if (file) {
                data[field] = `${envConstants.BASEURL}/uploads/${file.filename}`;
            }
        }

        const form = await FormModel.create(data);
        return response.status(201).json({ data: form });
    } catch (error) {
        console.log(error);
        
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return response.status(422).json({ error: handleMongooseValidation(error, "Form") });
        }

        console.error("Error in addForm:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
};



export const getForms = async (request, response) => {
    try {
        const { search = "", sort = "formName", order = "asc", page = 1, limit = 20, ...filters } = request.query;

        // Whitelist fields allowed for sorting (prevents query abuse)
        const allowedSortFields = ["formName", "formStatus", "createdAt"];
        const sortField = allowedSortFields.includes(sort) ? sort : "formName";
        const sortOrder = order === "desc" ? -1 : 1;

        // Sanitize and normalize pagination
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

        // Build query
        const query = {};
        if (search.trim()) {
            query.formName = { $regex: search.trim(), $options: "i" };
        }

        // Merge additional filters but only allow specific keys
        const allowedFilters = ["formName", "formStatus"];
        for (const key in filters) {
            if (allowedFilters.includes(key)) query[key] = filters[key];
        }

        // Fetch data with pagination
        const forms = await FormModel.find(query).sort({ [sortField]: sortOrder }).skip((pageNum - 1) * limitNum).limit(limitNum).lean().exec();
        const total = await FormModel.countDocuments(query);

        return response.status(200).json({
            forms,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching forms:", error);
        return response.status(500).json({ message: "Something went wrong while fetching forms records." });
    }
};


export const getSingleForm = async (request, response) => {
    try {
        if (request.params.id) {
            const form = await FormModel.findById(request.params.id).populate('studentID');
            return response.status(200).json({ form });
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}


export const updateForm = async (request, response) => {
    try {
        const data = request?.body;
        const form = await FormModel.findByIdAndUpdate(request.params.id, data, { new: true });
        return response.status(200).json({ form });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
            return response.status(422).json({ error: handleMongooseValidation(error, "Form") });
        }

        console.log(error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}


export const deleteForm = async (request, response) => {
    try {
        const deleted = await FormModel.findByIdAndDelete(request.params.id);
        if (deleted) return response.status(200).json({ message: "Form Successfully Deleted" });
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}


// export const studentAccount = async (student) => {
//     try {
//         const user = await UserModel.create({ fullName: student?.fullName, email: student?.email, password: student?.email });
//         return user;
//     } catch (error) {
//         if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
//             return { error: handleMongooseValidation(error, "User") };
//         }

//         return { error: "Internal Server Error", details: error };
//     }
// }