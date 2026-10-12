const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for basic UI interactions if needed
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
        }
    }
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register requests per hour
    message: 'Too many authentication attempts from this IP, please try again after an hour.'
});
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Management
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.sqlite',
        dir: './data'
    }),
    secret: process.env.SESSION_SECRET || 'fallback_secret_do_not_use_in_prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Serve static files from public
app.use(express.static(path.join(__dirname, '../public')));

// CSRF Middleware (Custom implementation)
const csrfProtection = require('./middleware/csrf');
app.use(csrfProtection.generateToken);
// Apply CSRF validation to all mutating methods
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return csrfProtection.validateToken(req, res, next);
    }
    next();
});

// CSRF Token Endpoint
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.session.csrfToken });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

// Default 404 for API
app.use('/api/*splat', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Fallback for SPA routing - serve index.html or 404 page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
