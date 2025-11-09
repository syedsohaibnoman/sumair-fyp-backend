import { model, Schema } from 'mongoose';
import validator from 'validator';

const { isEmail } = validator;

export const StudentSchema = new Schema(
    {
        userID: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        fullName: {
            type: String,
            required: [true, 'Full Name is required']
        },
        guardian: {
            type: String,
            required: [true, 'Guardian is required']
        },
        rollNo: {
            type: String,
            required: [true, 'Roll Number is required'],
            unique: true,
            trim: true
        },
        gender: {
            type: String,
            required: [true, 'Gender is required']
        },
        batch: {
            type: String,
            required: [true, 'Batch is required'],
            trim: true
        },
        program: {
            type: String,
            required: [true, 'Program is required']
        },
        semester: {
            type: String,
            required: [true, 'Semester is required']
        },
        dateOfBirth: {
            type: String,
            required: [true, 'Date of Birth is required']
        },
        contact: {
            type: String,
            required: [true, 'Contact is required'],
            unique: true,
            trim: true,
        },
        cnic: {
            type: String,
            required: [true, 'CNIC# is required'],
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            validate: [isEmail, 'Email should be valid'],
            lowercase: true,
            unique: true,
            trim: true,
            immutable: true
        },
        address: {
            type: String,
            required: [true, 'Address is required']
        },
        attendance: {
            type: String,
            default: "0"
        }
    },
    {
        timestamps: true
    }
);


export const StudentModel = model('Student', StudentSchema);