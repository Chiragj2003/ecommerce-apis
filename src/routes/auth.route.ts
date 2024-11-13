import { Request, Response, Router } from "express";
import { db } from "../db";
import bcrypt, { hash } from "bcryptjs";
import { RegisterSChema } from "../schemas/register.schema";
import { LoginSchema } from "../schemas/login.schema";
import { generateAccessToken } from "../controllers/tokens";
import { cookiesOption } from "../libs/constants";

const authRouter = Router();

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

authRouter.post("/login" , async (req,res) =>{
    try {
        const body = req.body
        const validatedSchema = await LoginSchema.safeParseAsync(body)
        if (!validatedSchema.success){
            return res.send("Either email or password invalid").status(400);
        }

        const user = await db.user.findUnique({
            where : {
                email : validatedSchema.data.email
            }
        })

        if (!user){
            return res.send("Account does not exits").status(404);
        }
        const isPasswordMatched = await bcrypt.compare(validatedSchema.data.password,user.password)
        if (!isPasswordMatched){
            return res.send("Invalid credentials").status(401);
        }

        const accessToken = generateAccessToken({
            ...user,
            name : user.name || undefined
        })

        return res.cookie("accessToken",accessToken , cookiesOption).send("User logged in successfully").status(200)

    } catch (error) { 
        console.log("LOGIN API ERROR ",error);
        return res.send("Internal Server Error").status(500);
        
    }
});



export { authRouter }