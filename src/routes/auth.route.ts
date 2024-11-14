import { Request, Response, Router } from "express";
import { db } from "../db";
import bcrypt, { hash } from "bcryptjs";
import { RegisterSChema } from "../schemas/register.schema";
import { LoginSchema } from "../schemas/login.schema";
import { generateAccessToken, generateVerificationToken, verifyVerificationToken } from "../controllers/tokens";
import { cookiesOption } from "../libs/constants";
import { sendEmail } from "../libs/email";
import { VerificationTokenSchema } from "../schemas/token.schema";

const authRouter = Router();


authRouter.post("/register", async(req, res)=>{
    try {
        const body = req.body;
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

        const token = await generateVerificationToken(user.email);
        if (!token) {
            return res.send("Something went wrong").status(401);
        }

        await sendEmail({
            email : user.email,
            name : user.name||undefined,
            token
        });

        return res.json({
            success : true,
            message : "Account created successfully",
            data : user
        });

    } catch (error) {
        console.log("REGISTER API ERROR", error);
        return res.send("Internal server error").status(500);
    }
});



authRouter.patch("/verify-account", async(req, res)=>{
    try {

        const body = req.body;
        const validatedSchema = await VerificationTokenSchema.safeParseAsync(body);

        if (!validatedSchema.success){
            return res.send("Verification token is required").status(400);
        }

        const token = validatedSchema.data.token;
        const isExpired = await verifyVerificationToken(token);
        if (isExpired) {
            return res.send("Your verification email has been expired").status(401);
        }

        return res.json({
            success : true,
            message : "Email verified successfully",
            data : null
        }).status(200);
    } catch (error) {
        console.error("VERIFICATION ACCOUNT PATCH API ERROR", error);
        return res.send("Internal server error").status(500)
    }
})



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

        if (!user.emailVerified) {
            const token = await generateVerificationToken(user.email);
            if (!token) {
                return res.send("Something went wrong").status(401);
            }

            await sendEmail({
                email : user.email,
                name : user.name||undefined,
                token
            });

            return res.json({
                success: true,
                message : "Verification email has been send",
                data : null
            }).status(200);
            
        }

        const accessToken = generateAccessToken({
            ...user,
            name : user.name || undefined
        })

        return res.cookie("accessToken",accessToken , cookiesOption).json({
            success: true,
            message : "User logged in successfully",
            data : null
        }).status(200)

    } catch (error) { 
        console.log("LOGIN API ERROR ",error);
        return res.send("Internal Server Error").status(500);
        
    }
});



export { authRouter }
