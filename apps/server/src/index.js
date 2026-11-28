require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const sellerRoutes = require('./routes/seller.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const fs = require('fs');

const publicRoutes = require('./routes/public.routes');
const authRoutes = require('./routes/auth.routes');
const { sendError } = require('./utils/response');

const app = express();
app.set('trust proxy', 1);
fs.mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173, http://localhost:5174')
    .split(',')
    .map((o) => o.trim());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/v1/health', (req, res) => {
    res.json({success: true, message: 'OK'});
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', publicRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/orders', checkoutRoutes);

app.use((err, req, res, next)=> {
    console.error(err);
    return sendError(res, 'Internal server error', 500);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));