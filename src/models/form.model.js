import { model, Schema } from 'mongoose';

export const FormSchema = new Schema(
    {
        userID: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"]
        },
        studentID: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student ID is required"]
        },
        sessionID: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: [true, "Session ID is required"]
        },
        formType: {
            type: String,
            required: [true, 'Form Type is required'],
            enum: ["regular-form", "improvement-form"],
        },
        formStatus: {
            type: String,
            enum: ["pending", "approved"],
            default: "pending"
        },
        subjects: {
            type: [String],
            required: [true, 'Subject is required'],
            default: []
        },
        profilePicture: {
            type: String,
            required: [true, 'Profile Picture is required']
        },
        anualChallan: {
            type: String,
            required: [true, 'Anual Challan is required']
        },
        universityIdCard: {
            type: String,
            required: [true, 'University ID Card is required']
        },
        paymentReceipt: {
            type: String,
            required: [true, 'Payment Receipt is required']
        }
    },
    {
        timestamps: true
    }
);


export const FormModel = model('Form', FormSchema);