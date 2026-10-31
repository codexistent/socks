import nodemailer from "nodemailer";
import {NEWS_SUMMARY_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";
import {getUnsubscribeUrl} from "@/lib/unsubscribe";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Socks" <particularpearl@gmail.com>`,
        to: email,
        subject: `Welcome to Socks - your stock market toolkit is ready!`,
        text: 'Thanks for joining Socks',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    { userId, email, date, newsContent } : {userId: string; email : string; date: string; newsContent: string }
): Promise<void> => {
    const unsubscribeUrl = getUnsubscribeUrl(userId);
    const oneClickUrl = getUnsubscribeUrl(userId, '/api/unsubscribe');

    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent)
        .replace('{{unsubscribeUrl}}', unsubscribeUrl)
        .replace('{{appUrl}}', process.env.BETTER_AUTH_URL ?? '');

    const mailOptions = {
        from: `"Socks News" <particularpearl@gmail.com>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from Socks. Unsubscribe: ${unsubscribeUrl}`,
        html: htmlTemplate,
        headers: {
            'List-Unsubscribe' : `<${oneClickUrl}>`,
            'List-Unsubscribe-Post' : 'List-Unsubscribe=One-Click',
        },
    }

    await transporter.sendMail(mailOptions);
};