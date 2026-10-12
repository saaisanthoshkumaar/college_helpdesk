const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { requireRole } = require('../middleware/authorize');
const { dbGet, dbAll, dbRun } = require('../database/connection');

router.use(authenticate);
router.use(requireRole(['student']));

// Get Profile
router.get('/profile', async (req, res) => {
    try {
        const student = await dbGet('SELECT id, name, college_id, email, department, academic_year, status, created_at FROM students WHERE id = ?', [req.session.userId]);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Could not fetch profile' });
    }
});

// Update Profile (only limited fields, like name)
router.put('/profile', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        
        await dbRun('UPDATE students SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, req.session.userId]);
        req.session.name = name; // update session name
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Could not update profile' });
    }
});

// Dashboard Data
router.get('/dashboard', async (req, res) => {
    try {
        const recentNotices = await dbAll('SELECT id, title, category, created_at FROM notices WHERE published = 1 ORDER BY created_at DESC LIMIT 5');
        const student = await dbGet('SELECT name, department FROM students WHERE id = ?', [req.session.userId]);
        
        res.json({
            student,
            recentNotices
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Could not fetch dashboard data' });
    }
});

// Get Notices (Authenticated)
router.get('/notices', async (req, res) => {
    try {
        // Can add department specific filtering in the future
        const notices = await dbAll('SELECT * FROM notices WHERE published = 1 ORDER BY created_at DESC');
        res.json(notices);
    } catch (error) {
        console.error('Notices error:', error);
        res.status(500).json({ error: 'Could not fetch notices' });
    }
});

// Get FAQs (Authenticated)
router.get('/faqs', async (req, res) => {
    try {
        const faqs = await dbAll('SELECT id, question, answer, category FROM faqs WHERE published = 1 ORDER BY category, id DESC');
        res.json(faqs);
    } catch (error) {
        console.error('FAQs error:', error);
        res.status(500).json({ error: 'Could not fetch FAQs' });
    }
});

module.exports = router;
