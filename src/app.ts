import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.route";


const app = express();

app.use(express.json());

app.use(cors({
    origin : ["http://localhost:3000"],
    methods : ["GET", "POST", "PATCH", "PUT", "DELETE"]
}));

app.use(cookieParser());

app.use("/api/auth", authRouter);


export { app }