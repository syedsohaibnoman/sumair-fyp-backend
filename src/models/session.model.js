import { model, Schema } from 'mongoose';


export const SessionSchema = new Schema(
    {
        sessionName: {
            type: String,
            required: [true, 'Session Name is required']
        },
        startDate: {
            type: Date,
            required: [true, 'Start Date is required']
        },
        endDate: {
            type: Date,
            required: [true, 'End Date is required']
        },
        batch: {
            type: String,
            required: [true, 'Batch is required']
        },
        shift: {
            type: String,
            required: [true, 'Shift is required']
        },
        programs: {
            type: [String],
            required: [true, 'Programs is required'],
            default: []
        },
        fees: {
            type: String
        }
    },
    {
        timestamps: true
    }
);


export const SessionModel = model('Session', SessionSchema);