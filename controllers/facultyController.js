const Faculty = require('../models/Faculty');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendInvitationEmail } = require('../utils/emailService');
const fs = require('fs');
const path = require('path');

// Create Faculty (Admin, Faculty, Supporting Staff can create?) 
// RBAC says: Admin (Add), Faculty (Add), Staff (Add) -> Yes. 
exports.createFaculty = async (req, res) => {
    try {
        const { name, qualification, designation, teachingExp, email, mobileNo } = req.body;
        // profilePhoto might be in req.file
        let profilePhoto = req.file ? req.file.filename : null;

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate Invitation Token
        const invitationToken = crypto.randomBytes(32).toString('hex');

        // Create User (Place-holder for invitation)
        user = await User.create({
            username: email.split('@')[0], // Provisional
            email,
            password_hash: 'INVITED', // Mark as invited
            role: 'faculty',
            invitationToken,
            isVerified: false
        });

        // Create Faculty Profile
        const faculty = await Faculty.create({
            name,
            qualification,
            designation,
            teachingExp,
            email,
            mobileNo,
            profilePhoto
        });

        // Send Welcome Message from AI & DS Dept
        await sendInvitationEmail(email, invitationToken, 'faculty');

        res.status(201).json({
            message: 'Faculty added successfully. Welcome invitation sent from AI & DS Dept.',
            faculty
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GetAll (View)
exports.getAllFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findAll();
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GetOne (View/Edit)
exports.getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await Faculty.findByPk(id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update (Edit)
exports.updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await Faculty.findByPk(id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const updateData = { ...req.body };

        // Handle Image Update
        if (req.file) {
            // Delete old image if exists
            if (faculty.profilePhoto) {
                const oldPath = path.join(__dirname, '../uploads', faculty.profilePhoto);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            updateData.profilePhoto = req.file.filename;
        }

        await faculty.update(updateData);
        res.json({ message: 'Faculty updated successfully', faculty });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete (Admin ONLY)
exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await Faculty.findByPk(id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        // Delete Image
        if (faculty.profilePhoto) {
            const oldPath = path.join(__dirname, '../uploads', faculty.profilePhoto);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Also delete the User account?
        // Ideally yes.
        const user = await User.findOne({ where: { email: faculty.email } });
        if (user) await user.destroy();

        await faculty.destroy();
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
