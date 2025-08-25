import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
    {
        first_name: {
            type: String,
            required: [true, "First name is required"],
            minLength: [3, "Full name must be atleast 5 characters long"],
            maxLength: [
                15,
                "Full name must not exceed more than 15 characters",
            ],
            lowercase: true,
            trim: true,
        },
        last_name: {
            type: String,
            required: [true, "Last name is required"],
            minLength: [3, "Full name must be atleast 5 characters long"],
            maxlength: [15, "Last name cannot exceed 15 characters"],
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false,
        },
        last_login: {
            type: Date,
            default: null,
        },
        forgot_password_token: String,
        forgot_password_expiry: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.virtual("full_name").get(function () {
    return `${this.first_name} ${this.last_name}`;
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateJWTToken = async function () {
    return await jwt.sign(
        {
            id: this._id,
            email: this.email,
            first_name: this.first_name,
            last_name: this.last_name,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY || "1d",
        }
    );
};

userSchema.methods.generatePasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.forgot_password_token = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.forgot_password_expiry = Date.now() + 15 * 60 * 1000;
    return resetToken;
};
userSchema.methods.toSafeObject = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = model("User", userSchema);
export default User;
