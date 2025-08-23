// seedLeads.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Lead from "./models/lead.model.js"; // adjust path
import User from "./models/user.model.js";

dotenv.config();

const sampleSources = [
    "website",
    "facebook_ads",
    "google_ads",
    "referral",
    "events",
    "other",
];
const sampleStatuses = ["new", "contacted", "qualified", "lost", "won"];
const sampleCities = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Pune",
    "Jaipur",
    "Hyderabad",
    "Indore",
];
const cityStateMap = {
    Delhi: "DELHI",
    Mumbai: "MAHARASHTRA",
    Bangalore: "KARNATAKA",
    Chennai: "TAMIL NADU",
    Kolkata: "WEST BENGAL",
    Ahmedabad: "GUJARAT",
    Pune: "MAHARASHTRA",
    Jaipur: "RAJASTHAN",
    Hyderabad: "TELANGANA",
    Indore: "MADHYA PRADESH",
};
const sampleCompanies = [
    "ACME Corp",
    "Globex",
    "Initech",
    "Umbrella",
    "Hooli",
    "Microsoft",
    "Google",
    "Apple",
    "Amazon",
    "Tesla"
];

const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const generateLeads = (numLeads, userId) => {
    const leads = [];
    for (let i = 0; i < numLeads; i++) {
        const city = sampleCities[randomInt(0, sampleCities.length - 1)];
        const state = cityStateMap[city]; // get the state for the city

        leads.push({
            first_name: `TestFirst${i}`,
            last_name: `TestLast${i}`,
            email: `test${i}@example.com`,
            phone: `9${randomInt(100000000, 999999999)}`,
            company: sampleCompanies[randomInt(0, sampleCompanies.length - 1)],
            city,
            state,
            source: sampleSources[randomInt(0, sampleSources.length - 1)],
            status: sampleStatuses[randomInt(0, sampleStatuses.length - 1)],
            score: randomInt(0, 100),
            lead_value: randomInt(1000, 10000),
            is_qualified: Math.random() > 0.5,
            assigned_to: userId,
            notes: "This is a test lead",
        });
    }
    return leads;
};

const DB = process.env.MONGODB_URI;

const seedLeads = async () => {
    try {
        await mongoose.connect(DB);
        console.log("MongoDB connected");

        // Replace with a valid test user ID from your User collection
        const testUser = await User.findOne();
        if (!testUser)
            throw new Error("No user found. Create a test user first.");

        const leads = generateLeads(100, testUser._id);

        await Lead.insertMany(leads);
        console.log("100+ test leads inserted successfully!");

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        mongoose.disconnect();
    }
};

seedLeads();
