import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import errorMiddleware from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.routes.js"
config();

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/ping", (req, res) => {
    res.send("Pong");
});

app.use("/api/v1/users", userRoutes);
app.all("*", (req,res)=>{
    res.status(404).send("OOPS! 404 page not found")
})
app.use(errorMiddleware);
export default app;
