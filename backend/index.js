
//add  backend base api in constant/config.ts
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const morgan = require('morgan')
const { sequelize } = require('./config/database');

const menuRoutes = require('./routes/menuRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');

// const paymentRoutes = require('./routes/paymentRoutes'); 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('short'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        await sequelize.sync(); 
        console.log('All models were synchronized successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
};

let isDbConnected = false;

app.use('/api/menu', menuRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/payment', paymentRoutes); 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Cronjob
cron.schedule('0 1 * * *', () => {
    console.log('-------------------------------------------');
    console.log('Running the daily cleanup task for expired coupons...');
    // cleanupExpiredCoupons();
    console.log('Daily cleanup task initiated.');
    console.log('-------------------------------------------');
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log('Scheduled daily cleanup job to run at 1:00 AM.');

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    dbConnected: isDbConnected,
    timestamp: new Date(),
  });
});

const startServer = async () => {
    isDbConnected = await connectToDatabase();

    app.listen(PORT, () => {
        console.log(`\nServer is running on http://localhost:${PORT}`);
        console.log('Admin panel is available at http://localhost:3001');
    });
};

startServer();
