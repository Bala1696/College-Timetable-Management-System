const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const userRoutes = require('./routes/userRoutes');
const exportRoutes = require('./routes/exportRoutes');
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/export', exportRoutes);
app.use('/api/students', require('./routes/studentRoutes'));
app.get('/', (req, res) => {
    res.send('College Timetable System API');
});

const bcrypt = require('bcrypt');
const User = db.User;

async function createAdmin() {
    try {
        const existingAdmin = await User.findOne({
            where: { email: 'admin123@gmail.com' }
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123@', 10);
            await User.create({
                username: 'Admin',
                email: 'admin123@gmail.com',
                password_hash: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Admin created successfully');
        } else {
            console.log('ℹ️ Admin already exists');
        }
    } catch (err) {
        console.error('❌ Error creating admin:', err);
    }
}

// Database Connection & Server Start
db.sequelize.sync({ alter: true })
    .then(async () => {
        console.log('Database connected and models synced.');
        await createAdmin();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });
