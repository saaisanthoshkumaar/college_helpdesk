const fs = require('fs');
const path = require('path');
const { dbRun } = require('../src/database/connection');

const initDatabase = async () => {
    try {
        console.log('Initializing database schema...');
        const schemaPath = path.join(__dirname, '..', 'src', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split statements by semicolon and run sequentially
        const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        for (const statement of statements) {
            await dbRun(statement);
        }

        console.log('Database schema initialized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize database schema:', error);
        process.exit(1);
    }
};

initDatabase();
