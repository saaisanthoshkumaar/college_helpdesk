const crypto = require('crypto');

const generateToken = (req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    next();
};

const validateToken = (req, res, next) => {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    // Skip CSRF validation for public chat, auth entry points, and the authenticated logout action
    if (
        req.path === '/api/public/chat' ||
        req.path === '/api/auth/register' ||
        req.path === '/api/auth/login' ||
        req.path === '/api/auth/logout'
    ) {
        return next();
    }

    if (!token || token !== req.session.csrfToken) {
        return res.status(403).json({ error: 'Invalid or missing CSRF token' });
    }
    next();
};

module.exports = {
    generateToken,
    validateToken
};
