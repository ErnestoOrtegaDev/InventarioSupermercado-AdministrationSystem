import { Resend } from 'resend';

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

const resend = new Resend(process.env.RESEND_API_KEY); 

export const sendEmail = async (options: EmailOptions) => {
    const { data, error } = await resend.emails.send({
        from: 'StockMaster <onboarding@resend.dev>', 
        to: options.email,
        subject: options.subject,
        html: options.message,
    });

    if (error) {
        throw new Error(error.message);
    }
    
    return data;
};