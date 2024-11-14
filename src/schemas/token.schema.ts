import * as z from "zod";

export const VerificationTokenSchema = z.object({
    token : z.string().min(10)
})