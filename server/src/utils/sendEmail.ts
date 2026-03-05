import nodemailer from 'nodemailer';

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

export const sendEmail = async (options: EmailOptions) => {
    // Crear el transportador (Configuración de tu correo)
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Usaremos Gmail para desarrollo
        auth: {
            user: process.env.EMAIL_USER, // Tu correo
            pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación
        },
    });

    // Definir las opciones del correo
    const mailOptions = {
        from: '"StockMaster Admin" <no-reply@stockmaster.com>',
        to: options.email,
        subject: options.subject,
        html: options.message, // Usamos HTML para que el correo se vea profesional
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
};