const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const pool = require('../db/pool');
const { sendSuccess, sendError } = require('../utils/response');
const { requireSeller } = require('../middleware/auth.middleware');

const router = express.Router();

const COOKIE_NAME = 'yaya_token';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // maksimal 10 percobaan per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    sendError(res, 'Too many login attempts, please try again later', 429),
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  };
}

// POST /api/v1/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return sendError(res, 'Validation failed', 422, errors);
    }

    const { email, password } = parsed.data;
    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return sendSuccess(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      'Login successful'
    );
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', requireSeller, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1 LIMIT 1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, rows[0]);
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
  return sendSuccess(res, null, 'Logout successful');
});

module.exports = router;