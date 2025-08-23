import AppError from "../utils/error.util.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isLoggedIn = async (req, res, next) => {
    const token = req.cookies;

    if(!token) {
        return next(new AppError("Unauthenticated, please login", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(!decoded) {
        return next(new AppError("Unauthenticated, please login", 401));
    }
    req.user = decoded;

    next();
}

export {isLoggedIn};