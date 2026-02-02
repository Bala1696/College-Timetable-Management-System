const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' for simplicity, or configure host/port for others
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendVerificationEmail = async (email, token) => {
    // Determine frontend URL from env or default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Ensure no double slashes if frontendUrl ends with /
    const baseUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
    const url = `${baseUrl}/verify-email/${token}`;

    console.log('Sending verification email to:', email);
    console.log('Verification Link:', url); // Log for debugging

    try {
        await transporter.sendMail({
            from: `"Artificial Intelligence and Data Science Department" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your Email',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Verify your Email Address</h2>
                    <p>Thank you for registering properly. Please confirm your account by clicking the link below:</p>
                    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verify Email</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        // Don't throw logic error here to avoid crashing the auth flow, 
        // but typically you'd want to handle this.
    }
};

exports.sendPasswordResetEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${frontendUrl}/reset-password/${token}`;

    try {
        await transporter.sendMail({
            from: `"Artificial Intelligence and Data Science Department" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Reset Password</h2>
                    <p>You requested a password reset. Click the link below to set a new password:</p>
                    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">Link expires in 15 minutes.</p>
                </div>
            `,
        });
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
};
exports.sendInvitationEmail = async (email, token, role) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const baseUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
    const url = `${baseUrl}/signup?invitation_token=${token}`;

    const roleName = role === 'faculty' ? 'Faculty Member' : 'Supporting Staff';

    try {
        await transporter.sendMail({
            from: `"Artificial Intelligence and Data Science Department" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Invitation to join Artificial Intelligence and Data Science Department`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 25px; color: #1f2937; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h2 style="color: #4f46e5; margin: 0;">Welcome to AI & DS Dept</h2>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">College Timetable System</p>
                    </div>
                    
                    <p>Hello,</p>
                    <p>You have been added as a <strong>${roleName}</strong> in the Department of Artificial Intelligence and Data Science by the Administrator.</p>
                    
                    <p>To access your dashboard and manage your schedule, please set up your account by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${url}" style="display: inline-block; padding: 12px 28px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Create Your Account</a>
                    </div>
                    
                    <p style="font-size: 14px;">Once you sign up, you will need to verify your email address to log in.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 25px 0;" />
                    
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated message. Please do not reply directly to this email.</p>
                </div>
            `,
        });
        console.log(`Invitation email sent to ${email}`);
    } catch (error) {
        console.error('Error sending invitation email:', error);
    }
};
