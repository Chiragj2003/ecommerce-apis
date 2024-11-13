import jwt from "jsonwebtoken"

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


