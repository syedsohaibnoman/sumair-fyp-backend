import { model, Schema } from 'mongoose';
import { compare, genSalt, hash } from 'bcrypt';
import validator from 'validator';

const { isEmail } = validator;

export const UserSchema = new Schema (
    {
        fullName: {
            type: String,
            required: [true, 'Full Name is required']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            validate: [isEmail, 'Email should be valid'],
            lowercase: true,
            unique: true,
            immutable: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        }
    },
    {
        timestamps: true
    }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
    next();
});

UserSchema.methods.isPasswordMatched = async function (password) {
    return await compare(password, this.password);
};


export const UserModel = model('User', UserSchema);