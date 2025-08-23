import { Router } from "express";
import {
    createLead,
    deleteLead,
    listWithPaginationAndFilters,
    getSingleLead,
    updateLead,
} from "../controllers/lead.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/leads", isLoggedIn, createLead);
router.get("/leads", isLoggedIn, listWithPaginationAndFilters);
router.get("/leads/:id", isLoggedIn, getSingleLead);
router.put("/leads/:id", isLoggedIn, updateLead);
router.delete("/leads/:id", isLoggedIn, deleteLead);

export default router;
