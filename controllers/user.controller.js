import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import sendEmail from "../utils/sendEmail.js";

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
};

const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if(!first_name || !last_name || !email || !password) {
            return next(new CustomError("All fields are required", 400));
        }

        const userExists = await User.findOne({ email });
        if(userExists) {
            return next(new CustomError("User already exists", 400));
        }

        const user = await User.create({ first_name, last_name, email, password });

        if(!user) {
            return next(new AppError("User not created", 400));
        }

        await user.save();
        user.password = undefined;
        const token = await user.generateJWTToken();

        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        });
    } catch (error) {
        next(new AppError("Internal server error", 500));
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return next(new AppError("All fields are required", 400));
        }

        const user = await User.findOne({ email }).select("+password");

        if(!(user && (await user.comparePassword(password)))) {
            return next(new AppError("Invalid credentials", 400));
        }

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
}

const logout = async (req, res, next) => {
    try {
        res.cookie("token", null, {
            secure : process.env.NODE_ENV === "production" ? true : false,
            maxAge: 0,
            httpOnly: true,
        })

        res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
}

const getUserDetails = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");

        res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user
        });
    } catch (error) {
        next(new AppError("Failed to fetch user details", 500));
    }
}

const updateUserDetails = async (req, res, next) => {
    try {
        const { first_name, last_name, email } = req.body;
        const userId = req.user._id;

        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return next(new AppError("Email already exists", 400));
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    ...(first_name && { first_name }),
                    ...(last_name && { last_name }),
                    ...(email && { email })
                }
            },
            {
                new: true,
                runValidators: true,
                select: "-password"
            }
        );

        if (!updatedUser) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User details updated successfully",
            user: updatedUser
        });
    } catch (error) {
        next(new AppError("Failed to update user details", 500));
    }
}

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError("Email not registered", 400));
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = "Password Reset";
    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank"> Reset your password</a>\n If the above link does not work for some reason then copy and paste this link in new tab ${resetPasswordURL}. \n If you have not requested this, kindly ignore.`;

    try {
        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`,
        });
    } catch (error) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();
        return next(new AppError(error.message, 500));
    }
};

const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;

    const { password } = req.body;

    const forgotPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    if (!password) {
        return next(new AppError("Password is required", 400));
    }

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new AppError("Token is invalid or expired. Please try again", 400)
        );
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
};

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword || !newPassword) {
        return next(new AppError("All fields are mandatory", 400));
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
        return next(new AppError("User does not exist", 400));
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
        return next(new AppError("Invalid old password", 400));
    }

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
};

export{
    register,
    login,
    logout,
    getUserDetails,
    updateUserDetails,
    forgotPassword,
    resetPassword,
    changePassword
}