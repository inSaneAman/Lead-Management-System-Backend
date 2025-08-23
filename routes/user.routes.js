import { Router } from "express";
import {
    register,
    login,
    logout,
    getUserDetails,
    updateUserDetails,
    changePassword,
    deleteUser
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/logout", isLoggedIn, logout);
router.get("/profile", isLoggedIn, getUserDetails);
router.put("/update-profile", isLoggedIn, updateUserDetails);
router.post("/change-password", isLoggedIn, changePassword);
router.delete("/delete-profile", isLoggedIn, deleteUser);
export default router;