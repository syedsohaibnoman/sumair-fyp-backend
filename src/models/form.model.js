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
        formName: {
            type: String,
            required: [true, 'Form Name is required']
        },
        formStatus: {
            type: String,
            required: [true, 'Form Status is required'],
            enum: ["pending", "approved"],
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