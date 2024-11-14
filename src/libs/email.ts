import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_SECRET)

interface EmailArgs {
    name?: string;
    email : string;
    verificationLink : string;
}


export const sendEmail = async ({
    email,
    verificationLink,
    name
}: EmailArgs)=>{
    try {


        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verification email',
            html: `
            <div>
                <pre>Dear ${name||"User"}</pre>
                <pre>Click here to verify</pre>
                <a href="${verificationLink}">Click here</a>
            </div>    
            `
        });
    } catch (error) {
        console.log("SEND EMAIL ERROR", error);
        throw new Error("Something went wrong while sending email");
    }
}