const SupportingStaff = require('../models/SupportingStaff');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendInvitationEmail } = require('../utils/emailService');
const fs = require('fs');
const path = require('path');

exports.createStaff = async (req, res) => {
    try {
        const { name, qualification, designation, experience, email, mobileNo } = req.body;
        let profilePhoto = req.file ? req.file.filename : null;

        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate Invitation Token
        const invitationToken = crypto.randomBytes(32).toString('hex');

        // Create User (Place-holder for invitation)
        user = await User.create({
            username: email.split('@')[0],
            email,
            password_hash: 'INVITED',
            role: 'supporting_staff',
            invitationToken,
            isVerified: false
        });

        const staff = await SupportingStaff.create({
            name,
            qualification,
            designation,
            experience,
            email,
            mobileNo,
            profilePhoto
        });

        // Send Welcome Message from AI & DS Dept
        await sendInvitationEmail(email, invitationToken, 'supporting_staff');

        res.status(201).json({
            message: 'Staff added successfully. Welcome invitation sent from AI & DS Dept.',
            staff
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllStaff = async (req, res) => {
    try {
        const staff = await SupportingStaff.findAll();
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await SupportingStaff.findByPk(id);
        if (!staff) return res.status(404).json({ message: 'Staff not found' });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await SupportingStaff.findByPk(id);
        if (!staff) return res.status(404).json({ message: 'Staff not found' });

        const updateData = { ...req.body };

        // Handle Image Update
        if (req.file) {
            // Delete old image if exists
            if (staff.profilePhoto) {
                const oldPath = path.join(__dirname, '../uploads', staff.profilePhoto);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            updateData.profilePhoto = req.file.filename;
        }

        await staff.update(updateData);
        res.json({ message: 'Staff updated successfully', staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await SupportingStaff.findByPk(id);
        if (!staff) return res.status(404).json({ message: 'Staff not found' });

        // Delete Image
        if (staff.profilePhoto) {
            const oldPath = path.join(__dirname, '../uploads', staff.profilePhoto);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const user = await User.findOne({ where: { email: staff.email } });
        if (user) await user.destroy();

        await staff.destroy();
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
