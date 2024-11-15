import * as z from "zod";

export const VerifyForgetPasswordSchema = z.object({
    token : z.string().min(10),
    password : z.string().min(6)
});

