import { isValidObjectId } from 'mongoose';
import { FormModel } from '../models/form.model.js';
import { handleMongooseValidation } from '../common/utils/mongooseValidator.js';
import envConstants from '../common/constants/env.constants.js';


// ~ Submit New Form ~
export const addForm = async (req, res) => {
    try {
        const { files, body } = req;
        const data = { ...body };

        const fileFields = [
            'profilePicture',
            'annualChallan',
            'universityIdCard',
            'paymentReceipt'
        ];

        for (const field of fileFields) {
            const file = files?.[field]?.[0];
            if (file?.filename) {
                data[field] = `${envConstants.BASE_URL}/uploads/${file.filename}`;
            }
        }

        const form = await FormModel.create(data);
        return res.status(201).json({ form });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return res.status(422).json({ error: handleMongooseValidation(error, "Form") });
        }

        console.error("Error in addForm:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// ~ Get Forms ~
export const getForms = async (req, res) => {
    try {
        const { search = "", sort = "formType", order = "asc", page = 1, limit = 20, ...filters } = req.query;

        // Whitelist fields allowed for sorting (prevents query abuse)
        const allowedSortFields = ["formType", "formStatus", "createdAt"];
        const sortField = allowedSortFields.includes(sort) ? sort : "formType";
        const sortOrder = order === "desc" ? -1 : 1;

        // Sanitize and normalize pagination
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

        // Build query
        const query = {};
        if (search.trim()) {
            query.formType = { $regex: search.trim(), $options: "i" };
        }

        // Merge additional filters but only allow specific keys
        const allowedFilters = ["formType", "formStatus"];
        for (const key in filters) {
            if (allowedFilters.includes(key)) query[key] = filters[key];
        }

        // Fetch data with pagination
        const forms = await FormModel.find(query).sort({ [sortField]: sortOrder }).skip((pageNum - 1) * limitNum).limit(limitNum).lean().exec();
        const total = await FormModel.countDocuments(query);

        return res.status(200).json({
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
        return res.status(500).json({ message: "Something went wrong while fetching forms records." });
    }
};


// ~ Get Single Form ~
export const getSingleForm = async (req, res) => {
    try {
        const formID = req.params.id;
        if (!isValidObjectId(formID)) return response.status(400).json({ message: "Invalid form ID" });

        const single = await FormModel.findById(formID).populate([
            { path: "studentID" },
            { path: "sessionID" }
        ]).lean();

        if (!single) return res.status(404).json({ message: "Form not found" });

        return res.status(200).json({ form: single });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Update Form ~
export const updateForm = async (req, res) => {
    try {
        const formID = req.params.id;
        if (!isValidObjectId(formID)) return response.status(400).json({ message: "Invalid form ID" });

        const data = req.body;
        if (!data || Object.keys(data).length === 0) return response.status(400).json({ message: "Request body cannot be empty" });

        const form = await FormModel.findById(formID);
        if (!form) return res.status(404).json({ message: "Form not found" });

        const updated = await FormModel.findByIdAndUpdate(formID, data, { new: true });
        return res.status(200).json({ form: updated });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return res.status(422).json({ error: handleMongooseValidation(error, "Form") });
        }

        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Delete Form ~
export const deleteForm = async (req, res) => {
    try {
        const formID = req.params.id;
        if (!isValidObjectId(formID)) return response.status(400).json({ message: "Invalid form ID" });

        const form = await FormModel.findById(formID);
        if (!form) return res.status(404).json({ message: "Form not found" });

        await FormModel.findByIdAndDelete(formID);
        return res.status(200).json({ message: "Form successfully deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}