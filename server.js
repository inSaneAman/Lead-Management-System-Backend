import app from "./app.js";
import connectDB from "./config/dbConnection.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
});
