import { Schema, model } from "mongoose";

const leadSchema = new Schema(
    {
        first_name: {
            type: String,
            required: [true, "First name is required"],
            minLength: [2, "First name must be at least 2 characters long"],
            maxLength: [
                15,
                "First name must not exceed more than 15 characters",
            ],
            lowercase: true,
            trim: true,
        },
        last_name: {
            type: String,
            required: [true, "Last name is required"],
            minLength: [2, "Last name must be at least 2 characters long"],
            maxLength: [15, "Last name cannot exceed 15 characters"],
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
        phone: {
            type: String,
            trim: true,
            match: [
                /^[\+]?[1-9][\d]{0,15}$/,
                "Please enter a valid phone number",
            ],
        },
        company: {
            type: String,
            trim: true,
            minLength: [3, "Company name must be atleast 3 characters long"],
            maxlength: [100, "Company name cannot exceed 100 characters"],
        },
        city: {
            type: String,
            trim: true,
            minLength: [3, "City name must be atleast 3 characters long"],
            maxlength: [50, "City name cannot exceed 50 characters"],
        },
        state: {
            type: String,
            trim: true,
            minLength: [3, "State name must be atleast 3 characters long"],
            maxlength: [50, "State name cannot exceed 50 characters"],
        },
        source: {
            type: String,
            required: [true, "Lead source is required"],
            enum: {
                values: [
                    "website",
                    "facebook_ads",
                    "google_ads",
                    "referral",
                    "events",
                    "other",
                ],
                message:
                    "Source must be one of: website, facebook_ads, google_ads, referral, events, other",
            },
        },
        status: {
            type: String,
            required: [true, "Lead status is required"],
            enum: {
                values: ["new", "contacted", "qualified", "lost", "won"],
                message:
                    "Status must be one of: new, contacted, qualified, lost, won",
            },
            default: "new",
        },
        score: {
            type: Number,
            min: [0, "Score cannot be less than 0"],
            max: [100, "Score cannot exceed 100"],
            default: 0,
        },
        lead_value: {
            type: Number,
            min: [0, "Lead value cannot be negative"],
            default: 0,
        },
        last_activity_at: {
            type: Date,
            default: null,
        },
        is_qualified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

leadSchema.virtual("full_name").get(function () {
    return `${this.first_name} ${this.last_name}`;
});

leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ company: 1 });
leadSchema.index({ city: 1 });
leadSchema.index({ created_at: -1 });
leadSchema.index({ last_activity_at: -1 });
leadSchema.index({ score: -1 });
leadSchema.index({ lead_value: -1 });

leadSchema.index({ status: 1, source: 1 });
leadSchema.index({ status: 1, created_at: -1 });
leadSchema.index({ company: 1, city: 1 });

const Lead = model("Lead", leadSchema);
export default Lead;
