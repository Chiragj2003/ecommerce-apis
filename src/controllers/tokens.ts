import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from 'uuid';
import { db } from "../db";

interface AccessTokenArgs{
    id:string ;
    name ?:string ; 
    email : string 
}

export const generateAccessToken =  (args:AccessTokenArgs) => {
    return jwt.sign(
        args,
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn : "3d"
        }
    )
}


export const generateVerificationToken = async(email:string)=>{
    try {

        const token = uuidv4();
        const expires = new Date(Date.now()+10*60*1000)

        const existedToken = await db.verificationToken.findUnique({
            where : {
                email
            }
        });

        if (existedToken) {
            await db.verificationToken.delete({
                where : {
                    id : existedToken.id
                }
            });
        }

        const verificationToken = await db.verificationToken.create({
            data : {
                email,
                token,
                expires
            }
        });

        const jwtToken = jwt.sign({
                email,
                token
            },
            process.env.VERIFICATION_TOKEN_SECRET!,
            {
                expiresIn : "10m"
            }
        );

        return jwtToken;
        
    } catch (error) {
        console.log("GENERATE VERIFICATION TOKEN", error);
        return null;
    }
}


export const verifyVerificationToken = async(jwtToken: string) => {
    try {
        
        const data = jwt.verify(jwtToken, process.env.VERIFICATION_TOKEN_SECRET!);
        if (!data) {
            return false;
        }
        
        // @ts-ignore
        const { email, token } : { email: string, token: string } = data;
        const verificationToken = await db.verificationToken.findUnique({
            where : {
                email,
                token
            }
        });


        if (!verificationToken) {
            return false
        }

        const isExpired = new Date()> new Date(verificationToken.expires);
        
        if (!isExpired) {
            await db.user.update({
                where : {
                    email
                },
                data : {
                    emailVerified : true
                }
            });
        }

        return isExpired;

    } catch (error) {
        console.log("VERIFY VERIFICATION TOKEN");
        return false;
    }
}


export const generateForgetPasswordToken = async(email:string)=>{
    try {

        const token = uuidv4();
        const expires = new Date(Date.now()+10*60*1000)

        const existedToken = await db.forgetPasswordToken.findUnique({
            where : {
                email
            }
        });

        if (existedToken) {
            await db.forgetPasswordToken.delete({
                where : {
                    id : existedToken.id
                }
            });
        }

        const forgetPasswordToken = await db.forgetPasswordToken.create({
            data : {
                email,
                token,
                expires
            }
        });

        const jwtToken = jwt.sign({
                email,
                token
            },
            process.env.FORGET_PASSWORD_TOKEN_SECRET!,
            {
                expiresIn : "10m"
            }
        );

        return jwtToken;
        
    } catch (error) {
        console.log("GENERATE FORGET PASSWORD TOKEN", error);
        return null;
    }
}