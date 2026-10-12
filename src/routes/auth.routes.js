const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { dbRun, dbGet } = require('../database/connection');

// Regex for basic validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register (Student only)
router.post('/register', async (req, res) => {
    try {
        const { name, collegeId, email, password, confirmPassword } = req.body;

        // Basic validation
        if (!name || !collegeId || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }

        // Check eligibility
        const eligible = await dbGet('SELECT * FROM eligible_college_ids WHERE college_id = ? AND is_eligible = 1', [collegeId]);
        if (!eligible) {
            return res.status(400).json({ error: 'Invalid or ineligible college ID.' });
        }

        // Check if already registered
        const existingStudent = await dbGet('SELECT id FROM students WHERE college_id = ? OR email = ?', [collegeId, email]);
        if (existingStudent) {
            return res.status(400).json({ error: 'College ID or email is already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert student
        const result = await dbRun(
            'INSERT INTO students (college_id, name, email, password_hash, department, academic_year, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [collegeId, name, email, hashedPassword, eligible.department, eligible.academic_year, 'active']
        );

        // Mark eligible id as registered
        await dbRun('UPDATE eligible_college_ids SET is_eligible = 0, registered_at = CURRENT_TIMESTAMP WHERE college_id = ?', [collegeId]);

        res.status(201).json({ message: 'Registration successful. You can now log in.' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// Unified Login
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or collegeId

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Identifier and password are required.' });
        }

        // First check admins (by email)
        const admin = await dbGet('SELECT * FROM admins WHERE email = ?', [identifier]);
        if (admin) {
            if (admin.status !== 'active') {
                return res.status(401).json({ error: 'Account is deactivated.' });
            }
            const isMatch = await bcrypt.compare(password, admin.password_hash);
            if (isMatch) {
                // Regenerate session
                req.session.regenerate((err) => {
                    if (err) throw err;
                    req.session.userId = admin.id;
                    req.session.userRole = admin.role; // 'admin' or 'main_admin'
                    req.session.name = admin.name;
                    return res.json({ message: 'Login successful', role: admin.role, redirect: '/admin.html' });
                });
                return;
            }
        }

        // If not admin, check students (by email or college_id)
        const student = await dbGet('SELECT * FROM students WHERE email = ? OR college_id = ?', [identifier, identifier]);
        if (student) {
            if (student.status !== 'active') {
                return res.status(401).json({ error: 'Account is deactivated.' });
            }
            const isMatch = await bcrypt.compare(password, student.password_hash);
            if (isMatch) {
                // Regenerate session
                req.session.regenerate((err) => {
                    if (err) throw err;
                    req.session.userId = student.id;
                    req.session.userRole = 'student';
                    req.session.name = student.name;
                    req.session.collegeId = student.college_id;
                    return res.json({ message: 'Login successful', role: 'student', redirect: '/dashboard.html' });
                });
                return;
            }
        }

        // Generic error
        return res.status(401).json({ error: 'Invalid credentials.' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out successfully.' });
    });
});

// Auth Status (Me)
router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        return res.json({
            authenticated: true,
            userId: req.session.userId,
            role: req.session.userRole,
            name: req.session.name
        });
    }
    return res.json({ authenticated: false });
});

module.exports = router;
