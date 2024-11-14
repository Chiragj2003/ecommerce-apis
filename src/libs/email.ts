import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_SECRET)

interface EmailArgs {
    name?: string;
    email : string;
    token : string;
}


export const sendEmail = async ({
    email,
    token,
    name
}: EmailArgs)=>{
    try {

        const verificationLink = `${process.env.CLIENT_ORIGIN}/verify?token=${token}`

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verify your account',
            html: `
            <div>
                <pre>Dear ${name||"User"}</pre>
                <pre>Click here to verify your account</pre>
                <a href="${verificationLink}">Click here</a>
            </div>    
            `
        });
    } catch (error) {
        console.log("SEND EMAIL ERROR", error);
        throw new Error("Something went wrong while sending email");
    }
}