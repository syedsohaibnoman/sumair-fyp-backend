import { SessionModel } from '../models/session.model.js';
import { handleMongooseValidation } from '../common/utils/mongooseValidator.js';


export const addSession = async (request, response) => {
    try {
        const data = request?.body;
        const session = await SessionModel.create(data);
        return response.status(201).json({ data: session });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
            return response.status(422).json({ error: handleMongooseValidation(error, "Session") });
        } else {
            console.log(error);
            return response.status(500).json({ error: "Internal Server Error" });
        }
    }
}


export const getSessions = async (request, response) => {
    try {
        const { search = "", sort = "sessionName", order = "asc", page = 1, limit = 20, ...filters } = request.query;

        // Whitelist fields allowed for sorting (prevents query abuse)
        const allowedSortFields = ["sessionName", "batch", "createdAt"];
        const sortField = allowedSortFields.includes(sort) ? sort : "sessionName";
        const sortOrder = order === "desc" ? -1 : 1;

        // Sanitize and normalize pagination
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

        // Build query
        const query = {};
        if (search.trim()) {
            query.sessionName = { $regex: search.trim(), $options: "i" };
        }

        // Merge additional filters but only allow specific keys
        const allowedFilters = ["batch", "shift"];
        for (const key in filters) {
            if (allowedFilters.includes(key)) query[key] = filters[key];
        }

        // Fetch data with pagination
        const sessions = await SessionModel.find(query).sort({ [sortField]: sortOrder }).skip((pageNum - 1) * limitNum).limit(limitNum).lean().exec();
        const total = await SessionModel.countDocuments(query);

        return response.status(200).json({
            sessions,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return response.status(500).json({ message: "Something went wrong while fetching session records." });
    }
};


export const getSingleSession = async (request, response) => {
    try {
        const session = await SessionModel.findById(request.params.id);
        return response.status(200).json({ session });
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}


export const updateSession = async (request, response) => {
    try {
        const data = request?.body;
        let programs = [];

        if (Array.isArray(data.programs)) {
            programs = data.programs;
        } else if (typeof data.programs === 'string') {
            programs = data.programs.split(',').map(p => p.trim());
        }

        const startDate = data.startDate ? new Date(data.startDate) : null;
        const endDate = data.endDate ? new Date(data.endDate) : null;
        const updatedData = { ...data, programs, ...(startDate && { startDate }), ...(endDate && { endDate }) };

        const session = await SessionModel.findByIdAndUpdate(request.params.id, updatedData, { new: true, runValidators: true });
        if (!session) {return response.status(404).json({ error: "Session not found" });}

        return response.status(200).json({ message: "Session updated successfully", session });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
            return response.status(422).json({ error: handleMongooseValidation(error, "Session") });
        } else {
            console.error(error);
            return response.status(500).json({ error: "Internal Server Error" });
        }
    }
};


export const deleteSession = async (request, response) => {
    try {
        const deleted = await SessionModel.findByIdAndDelete(request.params.id);
        if (deleted) return response.status(200).json({ message: "Session Successfully Deleted" });
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}