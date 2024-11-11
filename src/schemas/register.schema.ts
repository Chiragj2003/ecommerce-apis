import * as z from "zod";

export const RegisterSChema = z.object({
    email : z.string().email(),
    password : z.string().min(6),
    name : z.string().optional()
});