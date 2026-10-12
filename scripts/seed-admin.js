require('dotenv').config();
const bcrypt = require('bcryptjs');
const { dbRun, dbGet } = require('../src/database/connection');

const seedAdmin = async () => {
    try {
        const email = process.env.INITIAL_ADMIN_EMAIL;
        const password = process.env.INITIAL_ADMIN_PASSWORD;

        if (!email || !password) {
            console.error('Error: INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be set in .env');
            process.exit(1);
        }

        if (password.length < 8) {
            console.error('Error: Initial admin password must be at least 8 characters long.');
            process.exit(1);
        }

        const existingAdmin = await dbGet('SELECT id FROM admins WHERE email = ?', [email]);
        if (existingAdmin) {
            console.log('Main admin already exists.');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await dbRun(
            'INSERT INTO admins (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
            ['Main Administrator', email, hashedPassword, 'main_admin', 'active']
        );

        console.log('Main admin created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed admin:', error);
        process.exit(1);
    }
};

seedAdmin();
