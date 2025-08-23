import { Router } from "express";
import {
    register,
    login,
    logout,
    getUserDetails,
    updateUserDetails,
    forgotPassword,
    resetPassword,
    changePassword,
} from "../controllers/user.controller.js";
import {isLoggedIn} from "../middlewares/auth.middleware.js"

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout",isLoggedIn, logout);
router.get("/profile",isLoggedIn, getUserDetails);
router.post("/forgot-password", forgotPassword);
router.post("/reset/:resetToken", resetPassword);
router.post("/change-password",isLoggedIn, changePassword);
router.put("/update-profile/:id",isLoggedIn, updateUserDetails);

export default router;