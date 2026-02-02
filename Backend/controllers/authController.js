const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
    try {
        const { username, email, password, role, department } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            role: role || 'student',
            department,
            verificationToken,
            isVerified: false
        });

        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: 'User created. Please verify your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ where: { verificationToken: token } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (user.isVerified) {
            return res.json({ message: 'Email already verified. You can login.' });
        }

        user.isVerified = true;
        // user.verificationToken = null; // Keep token to allow re-clicks (idempotency)
        await user.save();

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Optional: Enforce email verification
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendPasswordResetEmail(email, resetToken);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password_hash = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        user.password_hash = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.logout = async (req, res) => {
    try {
        // Since we use JWT, we mostly clear it on frontend.
        // Backend logout can be used for logging or token blacklisting (if implemented).
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.joinByInvitation = async (req, res) => {
    try {
        const { token, username, password } = req.body;

        const user = await User.findOne({ where: { invitationToken: token } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired invitation token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        user.username = username;
        user.password_hash = hashedPassword;
        user.invitationToken = null;
        user.verificationToken = verificationToken;
        user.isVerified = false;
        await user.save();

        await sendVerificationEmail(user.email, verificationToken);

        res.json({ message: 'Account set up successful. Please verify your email to login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
