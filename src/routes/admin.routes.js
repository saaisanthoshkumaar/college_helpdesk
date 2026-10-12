const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { requireRole } = require('../middleware/authorize');
const { dbRun, dbGet, dbAll } = require('../database/connection');
const { logActivity } = require('../services/audit');
const bcrypt = require('bcryptjs');

router.use(authenticate);
router.use(requireRole(['admin', 'main_admin']));

// Dashboard metrics
router.get('/dashboard', async (req, res) => {
    try {
        const studentCount = await dbGet('SELECT COUNT(*) as count FROM students');
        const adminCount = await dbGet('SELECT COUNT(*) as count FROM admins WHERE status = "active"');
        const faqCount = await dbGet('SELECT COUNT(*) as count FROM faqs WHERE published = 1');
        const noticeCount = await dbGet('SELECT COUNT(*) as count FROM notices WHERE published = 1');
        
        const recentActivity = await dbAll(`
            SELECT a.action, a.entity_type, a.created_at, ad.name as admin_name
            FROM admin_activity a
            JOIN admins ad ON a.admin_id = ad.id
            ORDER BY a.created_at DESC LIMIT 5
        `);

        res.json({
            students: studentCount.count,
            admins: adminCount.count,
            faqs: faqCount.count,
            notices: noticeCount.count,
            recentActivity
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Could not fetch dashboard metrics' });
    }
});

// --- FAQs ---
router.get('/faqs', async (req, res) => {
    try {
        const faqs = await dbAll('SELECT * FROM faqs ORDER BY created_at DESC');
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

router.post('/faqs', async (req, res) => {
    try {
        const { question, answer, category, keywords_json, published } = req.body;
        const result = await dbRun(
            'INSERT INTO faqs (question, answer, category, keywords_json, published, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [question, answer, category, keywords_json || '[]', published ? 1 : 0, req.session.userId, req.session.userId]
        );
        await logActivity(req.session.userId, 'CREATE', 'FAQ', result.lastID);
        res.status(201).json({ id: result.lastID, message: 'FAQ created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create FAQ' });
    }
});

router.put('/faqs/:id', async (req, res) => {
    try {
        const { question, answer, category, keywords_json, published } = req.body;
        await dbRun(
            'UPDATE faqs SET question=?, answer=?, category=?, keywords_json=?, published=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
            [question, answer, category, keywords_json, published ? 1 : 0, req.session.userId, req.params.id]
        );
        await logActivity(req.session.userId, 'UPDATE', 'FAQ', req.params.id);
        res.json({ message: 'FAQ updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update FAQ' });
    }
});

router.delete('/faqs/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM faqs WHERE id=?', [req.params.id]);
        await logActivity(req.session.userId, 'DELETE', 'FAQ', req.params.id);
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
});


// --- NOTICES ---
router.get('/notices', async (req, res) => {
    try {
        const notices = await dbAll('SELECT * FROM notices ORDER BY created_at DESC');
        res.json(notices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});

router.post('/notices', async (req, res) => {
    try {
        const { title, content, category, department, published } = req.body;
        const result = await dbRun(
            'INSERT INTO notices (title, content, category, department, published, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, content, category, department, published ? 1 : 0, req.session.userId, req.session.userId]
        );
        await logActivity(req.session.userId, 'CREATE', 'NOTICE', result.lastID);
        res.status(201).json({ id: result.lastID, message: 'Notice created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create notice' });
    }
});

router.put('/notices/:id', async (req, res) => {
    try {
        const { title, content, category, department, published } = req.body;
        await dbRun(
            'UPDATE notices SET title=?, content=?, category=?, department=?, published=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
            [title, content, category, department, published ? 1 : 0, req.session.userId, req.params.id]
        );
        await logActivity(req.session.userId, 'UPDATE', 'NOTICE', req.params.id);
        res.json({ message: 'Notice updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notice' });
    }
});

router.delete('/notices/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM notices WHERE id=?', [req.params.id]);
        await logActivity(req.session.userId, 'DELETE', 'NOTICE', req.params.id);
        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notice' });
    }
});

// --- COLLEGE INFORMATION ---
router.get('/information', async (req, res) => {
    try {
        const info = await dbAll('SELECT * FROM college_information ORDER BY created_at DESC');
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch information' });
    }
});

router.post('/information', async (req, res) => {
    try {
        const { title, content, category, department, source_reference, published } = req.body;
        const result = await dbRun(
            'INSERT INTO college_information (title, content, category, department, source_reference, published, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, content, category, department, source_reference, published ? 1 : 0, req.session.userId, req.session.userId]
        );
        await logActivity(req.session.userId, 'CREATE', 'INFORMATION', result.lastID);
        res.status(201).json({ id: result.lastID, message: 'Information created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create information' });
    }
});

router.put('/information/:id', async (req, res) => {
    try {
        const { title, content, category, department, source_reference, published } = req.body;
        await dbRun(
            'UPDATE college_information SET title=?, content=?, category=?, department=?, source_reference=?, published=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
            [title, content, category, department, source_reference, published ? 1 : 0, req.session.userId, req.params.id]
        );
        await logActivity(req.session.userId, 'UPDATE', 'INFORMATION', req.params.id);
        res.json({ message: 'Information updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update information' });
    }
});

router.delete('/information/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM college_information WHERE id=?', [req.params.id]);
        await logActivity(req.session.userId, 'DELETE', 'INFORMATION', req.params.id);
        res.json({ message: 'Information deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete information' });
    }
});

// --- STUDENTS ---
router.get('/students', async (req, res) => {
    try {
        const students = await dbAll('SELECT id, college_id, name, email, department, academic_year, status, created_at FROM students ORDER BY created_at DESC');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

router.patch('/students/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'deactivated'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        await dbRun('UPDATE students SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [status, req.params.id]);
        await logActivity(req.session.userId, 'UPDATE_STATUS', 'STUDENT', req.params.id, { status });
        res.json({ message: 'Student status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update student status' });
    }
});

// --- ADMINS ---
router.get('/admins', async (req, res) => {
    try {
        const admins = await dbAll('SELECT id, name, email, role, status, created_at FROM admins ORDER BY created_at DESC');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

router.post('/admins', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password || password.length < 8) {
            return res.status(400).json({ error: 'Valid name, email, and password (min 8 chars) are required.' });
        }

        const existingAdmin = await dbGet('SELECT id FROM admins WHERE email = ?', [email]);
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await dbRun(
            'INSERT INTO admins (name, email, password_hash, role, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'admin', 'active', req.session.userId]
        );
        
        await logActivity(req.session.userId, 'CREATE', 'ADMIN', result.lastID);
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

router.patch('/admins/:id/status', async (req, res) => {
    try {
        const adminIdToUpdate = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (!['active', 'deactivated'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const admin = await dbGet('SELECT role FROM admins WHERE id = ?', [adminIdToUpdate]);
        if (!admin) return res.status(404).json({ error: 'Admin not found' });

        if (admin.role === 'main_admin' && status === 'deactivated') {
            return res.status(403).json({ error: 'Cannot deactivate the main admin' });
        }
        
        if (req.session.userId === adminIdToUpdate && status === 'deactivated') {
            return res.status(403).json({ error: 'Cannot deactivate your own account' });
        }

        await dbRun('UPDATE admins SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [status, adminIdToUpdate]);
        await logActivity(req.session.userId, 'UPDATE_STATUS', 'ADMIN', adminIdToUpdate, { status });
        res.json({ message: 'Admin status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update admin status' });
    }
});

module.exports = router;
