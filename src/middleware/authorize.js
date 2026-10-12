const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized: Please log in' });
        }

        const userRole = req.session.userRole; // 'student', 'admin', 'main_admin'
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        
        next();
    };
};

module.exports = {
    requireRole
};
