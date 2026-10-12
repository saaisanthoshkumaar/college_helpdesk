const express = require('express');
const router = express.Router();
const { dbAll } = require('../database/connection');
const { matchQuestion } = require('../services/faq-matcher');
const rateLimit = require('express-rate-limit');

// Chatbot preview rate limiting
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 chat requests per windowMs
    message: 'Too many requests to the chatbot preview. Please log in for unlimited access.'
});

// Get published FAQs
router.get('/faqs', async (req, res) => {
    try {
        const faqs = await dbAll('SELECT id, question, answer, category FROM faqs WHERE published = 1 ORDER BY category, id DESC');
        res.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ error: 'Failed to load FAQs' });
    }
});

// Get published Notices
router.get('/notices', async (req, res) => {
    try {
        const notices = await dbAll('SELECT id, title, content, category, department, valid_from, valid_until, created_at FROM notices WHERE published = 1 ORDER BY created_at DESC');
        res.json(notices);
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Failed to load notices' });
    }
});

// Public Chatbot Preview
router.post('/chat', chatLimiter, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const match = await matchQuestion(message);

        let answer = "I couldn't find a verified answer. Please log in for more features or contact the college.";
        let category = null;

        if (match) {
            answer = match.answer;
            category = match.category;
        }

        // Public preview does not save history to the database for unauthenticated users
        res.json({
            answer,
            category,
            note: 'This is a limited preview. Log in for full features.'
        });

    } catch (error) {
        console.error('Public chat error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

module.exports = router;
