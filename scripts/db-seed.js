const { dbRun, dbGet } = require('../src/database/connection');

const faqs = [
    {
        question: 'How do I apply for a bonafide certificate?',
        answer: 'Please follow the certificate application process published by your college. You can request a bonafide certificate from the Student Services section of the portal or visit the admin office with your ID card.',
        category: 'Certificates',
        keywords_json: JSON.stringify(['bonafide', 'certificate', 'apply', 'request'])
    },
    {
        question: 'When will the semester exams begin?',
        answer: 'Please consult the official examination notice for the confirmed examination schedule. Usually, odd semester exams begin in November and even semester exams in May.',
        category: 'Examinations',
        keywords_json: JSON.stringify(['exams', 'semester', 'timetable', 'schedule', 'date'])
    },
    {
        question: 'What is the minimum attendance requirement?',
        answer: 'The minimum attendance requirement is typically 75% in each subject to be eligible to write the final semester examinations.',
        category: 'Attendance',
        keywords_json: JSON.stringify(['attendance', 'minimum', 'percentage', 'shortage'])
    }
];

const notices = [
    {
        title: 'Mid-Term Examination Schedule [DEMO]',
        content: 'The mid-term examinations for all departments will commence next week. Please check your respective department notice boards for the detailed timetable. This is a demonstration notice.',
        category: 'Examinations',
        department: 'All'
    },
    {
        title: 'Annual Sports Meet [DEMO]',
        content: 'The college annual sports meet will be held next month. Interested students should register with the Physical Education department.',
        category: 'Events',
        department: 'All'
    }
];

const collegeInfo = [
    {
        title: 'Library Timings',
        category: 'Timetable',
        content: 'The central library is open from 8:00 AM to 8:00 PM on weekdays, and 9:00 AM to 1:00 PM on Saturdays.',
        department: 'Library',
        source_reference: 'Library Rulebook'
    },
    {
        title: 'Fee Payment Process',
        category: 'Fees',
        content: 'Tuition fees must be paid through the official college payment gateway. Cash payments are not accepted.',
        department: 'Finance',
        source_reference: 'Finance Dept Guidelines'
    }
];

const seedDatabase = async () => {
    try {
        console.log('Seeding demo data...');
        
        // Assume admin 1 is seeding this (we will create admin 1 in a different script)
        const adminId = 1;

        // Seed FAQs
        for (const faq of faqs) {
            const exists = await dbGet('SELECT id FROM faqs WHERE question = ?', [faq.question]);
            if (!exists) {
                await dbRun(
                    'INSERT INTO faqs (question, answer, category, keywords_json, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
                    [faq.question, faq.answer, faq.category, faq.keywords_json, adminId, adminId]
                );
            }
        }
        
        // Seed Notices
        for (const notice of notices) {
            const exists = await dbGet('SELECT id FROM notices WHERE title = ?', [notice.title]);
            if (!exists) {
                await dbRun(
                    'INSERT INTO notices (title, content, category, department, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
                    [notice.title, notice.content, notice.category, notice.department, adminId, adminId]
                );
            }
        }
        
        // Seed College Info
        for (const info of collegeInfo) {
            const exists = await dbGet('SELECT id FROM college_information WHERE title = ?', [info.title]);
            if (!exists) {
                await dbRun(
                    'INSERT INTO college_information (title, category, content, department, source_reference, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [info.title, info.category, info.content, info.department, info.source_reference, adminId, adminId]
                );
            }
        }

        console.log('Demo data seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed demo data:', error);
        process.exit(1);
    }
};

seedDatabase();
