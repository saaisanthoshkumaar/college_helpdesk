const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { requireRole } = require('../middleware/authorize');
const { matchQuestion } = require('../services/faq-matcher');
const { dbRun, dbAll } = require('../database/connection');
const crypto = require('crypto');

// Apply authentication and student role requirement
router.use(authenticate);
router.use(requireRole(['student']));

const FALLBACK_MESSAGE = "I couldn't find a verified answer to that question in the available college information. Please contact the relevant department or check the official college notice.";

// Post a message
router.post('/message', async (req, res) => {
    try {
        const { message, sessionReference } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const ref = sessionReference || crypto.randomUUID();

        // 1. Match question
        const match = await matchQuestion(message);

        let answer = FALLBACK_MESSAGE;
        let faqId = null;
        let category = null;

        if (match) {
            answer = match.answer;
            faqId = match.faqId;
            category = match.category;
        }

        // 2. Save to history
        await dbRun(
            'INSERT INTO chat_history (student_id, session_reference, question, answer, matched_faq_id) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, ref, message, answer, faqId]
        );

        res.json({
            answer,
            category,
            faqId,
            sessionReference: ref
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// Get History
router.get('/history', async (req, res) => {
    try {
        const history = await dbAll(
            'SELECT * FROM chat_history WHERE student_id = ? ORDER BY created_at ASC',
            [req.session.userId]
        );
        res.json(history);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Could not fetch history' });
    }
});

// Clear History
router.delete('/history', async (req, res) => {
    try {
        await dbRun('DELETE FROM chat_history WHERE student_id = ?', [req.session.userId]);
        res.json({ message: 'History cleared' });
    } catch (error) {
        console.error('Delete history error:', error);
        res.status(500).json({ error: 'Could not clear history' });
    }
});

module.exports = router;
