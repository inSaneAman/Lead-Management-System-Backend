import Lead from "../models/lead.model.js";
import AppError from "../utils/error.util.js";

const createLead = async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            company,
            city,
            state,
            source,
            status,
            score,
            lead_value,
        } = req.body;
        console.log(req.body);
        // Check if lead with email already exists
        const existingLead = await Lead.findOne({ email });
        if (existingLead) {
            return next(
                new AppError("Lead with this email already exists", 400)
            );
        }

        if (!first_name || !last_name || !email || !source) {
            return next(
                new AppError(
                    "First name, last name, email, and source are required",
                    400
                )
            );
        }

        const newLead = await Lead.create({
            first_name,
            last_name,
            email,
            phone,
            company,
            city,
            state,
            source,
            status,
            score,
            lead_value,
        });

        if (!newLead) {
            return next(new AppError("Failed to create lead", 400));
        }

        await newLead.save();

        res.status(201).json({
            success: true,
            message: "Lead created successfully",
            data: newLead,
        });
    } catch (error) {
        console.log(error)
        next(new AppError("Internal server error", 500));
    }
};

const listWithPaginationAndFilters = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            // String field filters
            email,
            company,
            city,
            // Enum field filters
            status,
            source,
            // Number field filters
            score,
            score_gt,
            score_lt,
            score_between,
            lead_value,
            lead_value_gt,
            lead_value_lt,
            lead_value_between,
            // Date field filters
            created_at,
            created_at_before,
            created_at_after,
            created_at_between,
            last_activity_at,
            last_activity_at_before,
            last_activity_at_after,
            last_activity_at_between,
            // Boolean field filters
            is_qualified,
            // Array filters for enum fields
            status_in,
            source_in,
            // Search functionality
            search,
            // Sorting
            sort_by = "created_at",
            sort_order = "desc",
        } = req.query;

        // Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

        // Build filter object with AND logic
        const filter = {};

        // String field filters (equals, contains)
        if (email) {
            if (email.startsWith("*") && email.endsWith("*")) {
                // Contains search
                filter.email = { $regex: email.slice(1, -1), $options: "i" };
            } else {
                // Exact match
                filter.email = email.toLowerCase();
            }
        }

        if (company) {
            if (company.startsWith("*") && company.endsWith("*")) {
                // Contains search
                filter.company = {
                    $regex: company.slice(1, -1),
                    $options: "i",
                };
            } else {
                // Exact match
                filter.company = company.toLowerCase();
            }
        }

        if (city) {
            if (city.startsWith("*") && city.endsWith("*")) {
                // Contains search
                filter.city = { $regex: city.slice(1, -1), $options: "i" };
            } else {
                // Exact match
                filter.city = city.toLowerCase();
            }
        }

        // Enum field filters (equals, in)
        if (status && !status_in) {
            filter.status = status;
        }
        if (status_in) {
            try {
                const statusArray = JSON.parse(status_in);
                if (Array.isArray(statusArray)) {
                    filter.status = { $in: statusArray };
                }
            } catch (e) {
                return next(
                    new AppError(
                        "Invalid status_in format. Use JSON array.",
                        400
                    )
                );
            }
        }

        if (source && !source_in) {
            filter.source = source;
        }
        if (source_in) {
            try {
                const sourceArray = JSON.parse(source_in);
                if (Array.isArray(sourceArray)) {
                    filter.source = { $in: sourceArray };
                }
            } catch (e) {
                return next(
                    new AppError(
                        "Invalid source_in format. Use JSON array.",
                        400
                    )
                );
            }
        }

        // Number field filters (equals, gt, lt, between)
        if (score !== undefined) {
            filter.score = parseInt(score);
        }
        if (score_gt !== undefined) {
            filter.score = { ...filter.score, $gt: parseInt(score_gt) };
        }
        if (score_lt !== undefined) {
            filter.score = { ...filter.score, $lt: parseInt(score_lt) };
        }
        if (score_between) {
            try {
                const [min, max] = JSON.parse(score_between);
                if (
                    Array.isArray([min, max]) &&
                    min !== undefined &&
                    max !== undefined
                ) {
                    filter.score = { $gte: parseInt(min), $lte: parseInt(max) };
                }
            } catch (e) {
                return next(
                    new AppError(
                        "Invalid score_between format. Use JSON array [min, max].",
                        400
                    )
                );
            }
        }

        if (lead_value !== undefined) {
            filter.lead_value = parseInt(lead_value);
        }
        if (lead_value_gt !== undefined) {
            filter.lead_value = {
                ...filter.lead_value,
                $gt: parseInt(lead_value_gt),
            };
        }
        if (lead_value_lt !== undefined) {
            filter.lead_value = {
                ...filter.lead_value,
                $lt: parseInt(lead_value_lt),
            };
        }
        if (lead_value_between) {
            try {
                const [min, max] = JSON.parse(lead_value_between);
                if (
                    Array.isArray([min, max]) &&
                    min !== undefined &&
                    max !== undefined
                ) {
                    filter.lead_value = {
                        $gte: parseInt(min),
                        $lte: parseInt(max),
                    };
                }
            } catch (e) {
                return next(
                    new AppError(
                        "Invalid lead_value_between format. Use JSON array [min, max].",
                        400
                    )
                );
            }
        }

        // Date field filters (on, before, after, between)
        if (created_at) {
            const date = new Date(created_at);
            if (isNaN(date.getTime())) {
                return next(
                    new AppError("Invalid created_at date format", 400)
                );
            }
            filter.created_at = {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lt: new Date(date.setHours(23, 59, 59, 999)),
            };
        }
        if (created_at_before) {
            const date = new Date(created_at_before);
            if (isNaN(date.getTime())) {
                return next(
                    new AppError("Invalid created_at_before date format", 400)
                );
            }
            filter.created_at = { ...filter.created_at, $lt: date };
        }
        if (created_at_after) {
            const date = new Date(created_at_after);
            if (isNaN(date.getTime())) {
                return next(
                    new AppError("Invalid created_at_after date format", 400)
                );
            }
            filter.created_at = { ...filter.created_at, $gt: date };
        }
        if (created_at_between) {
            try {
                const [start, end] = JSON.parse(created_at_between);
                if (Array.isArray([start, end]) && start && end) {
                    const startDate = new Date(start);
                    const endDate = new Date(end);
                    if (
                        isNaN(startDate.getTime()) ||
                        isNaN(endDate.getTime())
                    ) {
                        return next(
                            new AppError(
                                "Invalid created_at_between date format",
                                400
                            )
                        );
                    }
                    filter.created_at = { $gte: startDate, $lte: endDate };
                }
            } catch (e) {
                return next(
                    new AppError(
                        "Invalid created_at_between format. Use JSON array [start, end].",
                        400
                    )
                );
            }
        }

        if (last_activity_at) {
            const date = new Date(last_activity_at);
            if (isNaN(date.getTime())) {
                return next(
                    new AppError("Invalid last_activity_at date format", 400)
                );
            }
            filter.last_activity_at = {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lt: new Date(date.setHours(23, 59, 59, 999)),
            };
        }
        if (last_activity_at_before) {
            const date = new Date(last_activity_at_before);
            if (isNaN(date.getTime())) {
                return next(
                    new AppError(
                        "Invalid last_activity_at_before date format",
                        400
                    )
                );
            }
            filter.last_activity_at = { ...filter.last_activity_at, $lt: date };
        }
        if (last_activity_at_after) {
            const date = new Date(last_activity_at_after);
            if (isNaN(date.getTime())) {
                return next(
                    new AppError(
                        "Invalid last_activity_at_after date format",
                        400
                    )
                );
            }
            filter.last_activity_at = { ...filter.last_activity_at, $gt: date };
        }
        if (last_activity_at_between) {
            try {
                const [start, end] = JSON.parse(last_activity_at_between);
                if (Array.isArray([start, end]) && start && end) {
                    const startDate = new Date(start);
                    const endDate = new Date(end);
                    if (
                        isNaN(startDate.getTime()) ||
                        isNaN(endDate.getTime())
                    ) {
                        return next(
                            new AppError(
                                "Invalid last_activity_at_between date format",
                                400
                            )
                        );
                    }
                    filter.last_activity_at = {
                        $gte: startDate,
                        $lte: endDate,
                    };
                }
            } catch (e) {
                return next(
                    new AppError(
                        "Invalid last_activity_at_between format. Use JSON array [start, end].",
                        400
                    )
                );
            }
        }

        // Boolean field filters (equals)
        if (is_qualified !== undefined) {
            filter.is_qualified =
                is_qualified === "true" || is_qualified === true;
        }

        // Global search functionality
        if (search) {
            filter.$or = [
                { first_name: { $regex: search, $options: "i" } },
                { last_name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
            ];
        }

        // Build sort object
        const sort = {};
        sort[sort_by] = sort_order === "desc" ? -1 : 1;

        // Calculate pagination
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination
        const leads = await Lead.find(filter)
            .populate("first_name last_name email")
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const totalLeads = await Lead.countDocuments(filter);
        const totalPages = Math.ceil(totalLeads / limitNum);

        // Return response in required format
        res.status(200).json({
            data: leads,
            page: pageNum,
            limit: limitNum,
            total: totalLeads,
            totalPages: totalPages,
        });
    } catch (error) {
        next(new AppError("Internal server error", 500));
    }
};

const getSingleLead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const lead = await Lead.findById(id).populate(
            "first_name last_name email"
        );

        if (!lead) {
            return next(new AppError("Lead not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Lead retrieved successfully",
            data: lead,
        });
    } catch (error) {
        next(error);
    }
};

const updateLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingLead = await Lead.findById(id);
        if (!existingLead) {
            return next(new AppError("Lead not found", 404));
        }

        if (updateData.email && updateData.email !== existingLead.email) {
            const emailExists = await Lead.findOne({
                email: updateData.email,
                _id: { $ne: id },
            });
            if (emailExists) {
                return next(
                    new AppError("Lead with this email already exists", 400)
                );
            }
        }

        if (updateData.status && updateData.status !== existingLead.status) {
            updateData.last_activity_at = new Date();
        }

        const updatedLead = await Lead.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("first_name last_name email");

        res.status(200).json({
            success: true,
            message: "Lead updated successfully",
            data: updatedLead,
        });
    } catch (error) {
        next(error);
    }
};

const deleteLead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const lead = await Lead.findById(id);
        if (!lead) {
            return next(new AppError("Lead not found", 404));
        }

        await Lead.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Lead deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export {
    createLead,
    listWithPaginationAndFilters,
    getSingleLead,
    updateLead,
    deleteLead,
};
