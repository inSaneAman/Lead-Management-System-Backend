import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "none",
};

const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        console.log(first_name, last_name, email, password);
        if (!first_name || !last_name || !email || !password) {
            return next(new AppError("All fields are required", 400));
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new AppError("User already exists", 400));
        }

        const user = await User.create({
            first_name,
            last_name,
            email,
            password,
        });

        if (!user) {
            return next(new AppError("User not created", 400));
        }
        await user.save();
        user.password = undefined;
        const token = await user.generateJWTToken();

        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        next(new AppError("Internal server error", 500));
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError("All fields are required", 400));
        }

        const user = await User.findOne({ email }).select("+password");

        if (!(user && (await user.comparePassword(password)))) {
            return next(new AppError("Invalid credentials", 400));
        }

        user.last_login = new Date();
        await user.save();

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
};

const logout = async (req, res, next) => {
    try {
        res.cookie("token", null, {
            secure: process.env.NODE_ENV === "production" ? true : false,
            maxAge: 0,
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        next(new AppError(error.message, 500));
    }
};

const getUserDetails = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");

        res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user,
        });
    } catch (error) {
        next(new AppError("Failed to fetch user details", 500));
    }
};

const updateUserDetails = async (req, res, next) => {
    try {
        const { first_name, last_name, email } = req.body;
        const userId = req.user._id;

        if (email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: userId },
            });
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
                    ...(email && { email }),
                },
            },
            {
                new: true,
                runValidators: true,
                
            }
        ).select("-password");

        if (!updatedUser) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User details updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        next(new AppError("Failed to update user details", 500));
    }
};

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
        return next(new AppError("All fields are mandatory", 400));
    }

    const user = await User.findById(userId).select("+password");

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

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return next(new AppError("User not found", 404));
        }

        res.cookie("token", null, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
        });

        res.status(200).json({
            success: true,
            message: "User profile deleted successfully",
        });
    } catch (error) {
        next(new AppError("Failed to delete user", 500));
    }
};

export {
    register,
    login,
    logout,
    getUserDetails,
    updateUserDetails,
    changePassword,
    deleteUser
};
