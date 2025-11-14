import { isValidObjectId } from 'mongoose';
import { SessionModel } from '../models/session.model.js';
import { handleMongooseValidation } from '../common/utils/mongooseValidator.js';


// ~ Add New Session ~
export const addSession = async (req, res) => {
    try {
        const session = await SessionModel.create(req?.body);
        return res.status(201).json({ session });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return res.status(422).json({ error: handleMongooseValidation(error, "Session") });
        }

        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Get Sessions ~
export const getSessions = async (req, res) => {
    try {
        const { search = "", sort = "sessionName", order = "asc", page = 1, limit = 20, ...filters } = req.query;

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

        return res.status(200).json({
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
        return res.status(500).json({ message: "Something went wrong while fetching session records." });
    }
};


// ~ Get Single Session ~
export const getSingleSession = async (req, res) => {
    try {
        const sessionID = req.params.id;
        if (!isValidObjectId(sessionID)) return res.status(400).json({ message: "Invalid session ID" });

        const session = await SessionModel.findById(sessionID);
        if (!session) return res.status(404).json({ message: "Session not found" });

        return res.status(200).json({ session });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


// ~ Update Session ~
export const updateSession = async (req, res) => {
    try {
        let programs = [];

        const sessionID = req.params.id;
        if (!isValidObjectId(sessionID)) return res.status(400).json({ message: "Invalid session ID" });

        const data = req.body;
        if (!data || Object.keys(data).length === 0) return res.status(400).json({ message: "req body cannot be empty" });

        const session = await SessionModel.findById(sessionID);
        if (!session) return res.status(404).json({ message: "Session not found" });

        if (Array.isArray(data.programs)) {
            programs = data.programs;
        } else if (typeof data.programs === 'string') {
            programs = data.programs.split(',').map(p => p.trim());
        }

        const startDate = data.startDate ? new Date(data.startDate) : null;
        const endDate = data.endDate ? new Date(data.endDate) : null;
        const updatedData = { ...data, programs, ...(startDate && { startDate }), ...(endDate && { endDate }) };

        const updated = await SessionModel.findByIdAndUpdate(sessionID, updatedData, { new: true, runValidators: true });
        return res.status(200).json({ session: updated });
    } catch (error) {
        if (['ValidationError', 'MongoServerError'].includes(error.name)) {
            return res.status(422).json({ error: handleMongooseValidation(error, "Session") });
        }

        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// ~ Delete Session ~
export const deleteSession = async (req, res) => {
    try {
        const sessionID = req.params.id;
        if (!isValidObjectId(sessionID)) return res.status(400).json({ message: "Invalid session ID" });

        const session = await SessionModel.findById(sessionID);
        if (!session) return res.status(404).json({ message: "session not found" });

        await SessionModel.findByIdAndDelete(sessionID);
        return res.status(200).json({ message: "Session successfully deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}