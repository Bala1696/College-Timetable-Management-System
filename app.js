const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'defaultSecret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true if https
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
    })
);

const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  credentials: true, 
};
app.use(cors(corsOptions));
app.use(morgan('tiny'));
app.use(helmet());

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
app.use('/api/workload', require('./routes/workloadRoutes'));
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
db.sequelize.sync()
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

    module.exports=app
