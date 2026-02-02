const User = require('../models/User');

// Get all users (can filter by role)
exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const whereClause = {};

        if (role) {
            whereClause.role = role;
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'username', 'email', 'role', 'department'], // Exclude password
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
