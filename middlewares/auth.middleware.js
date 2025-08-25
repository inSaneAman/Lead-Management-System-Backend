import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";

const isLoggedIn = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token;
        if (req.cookies?.token) {
            token = req.cookies.token;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next(new AppError("Unauthenticated, please login", 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded?.id) {
            return next(new AppError("Invalid token", 401));
        }

        // Find user and attach to request
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return next(new AppError("User not found", 401));
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return next(new AppError("Invalid token", 401));
        }
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Token expired", 401));
        }
        return next(new AppError("Authentication failed", 401));
    }
};

export { isLoggedIn };
