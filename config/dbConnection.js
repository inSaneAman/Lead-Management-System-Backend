import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(
            `${process.env.MONGODB_URI}?retryWrites=true&w=majority`
        );
        if (connection) {
            console.log(`MongoDB connected ${connection.connection.host}`);
        }
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
