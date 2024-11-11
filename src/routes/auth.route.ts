import { Request, Response, Router } from "express";
import { db } from "../db";
import bcrypt from "bcryptjs";
import { RegisterSChema } from "../schemas/register.schema";

const authRouter = Router();

// @ts-ignore
authRouter.post("/register", async(req, res)=>{
    try {
        const body = req.body;
        console.log(body);
        const validatedSchema = await RegisterSChema.safeParseAsync(body);

        if (!validatedSchema.success) {
            return res.send("Invalid fields").status(400);
        }

        const { email, password, name } = validatedSchema.data

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data : {
                email,
                password : hashedPassword,
                name
            },
            select : {
                id : true,
                email : true,
                name : true
            }
        });

        return res.json(user);

    } catch (error) {
        console.log("REGISTER API ERROR", error);
        return res.send("Internal server error").status(500);
    }
});

export { authRouter }