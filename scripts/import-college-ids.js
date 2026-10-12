const { dbRun, dbGet } = require('../src/database/connection');

const demoIds = [
    { college_id: 'DEMO2026001', department: 'Computer Science', academic_year: '1st Year' },
    { college_id: 'DEMO2026002', department: 'Computer Science', academic_year: '2nd Year' },
    { college_id: 'DEMO2026003', department: 'Electrical Engineering', academic_year: '3rd Year' },
    { college_id: 'DEMO2026004', department: 'Mechanical Engineering', academic_year: '4th Year' },
    { college_id: 'DEMO2026005', department: 'Information Technology', academic_year: '1st Year' }
];

const importIds = async () => {
    try {
        console.log('Importing eligible college IDs for demo...');
        
        for (const data of demoIds) {
            const exists = await dbGet('SELECT id FROM eligible_college_ids WHERE college_id = ?', [data.college_id]);
            if (!exists) {
                await dbRun(
                    'INSERT INTO eligible_college_ids (college_id, department, academic_year, is_eligible) VALUES (?, ?, ?, ?)',
                    [data.college_id, data.department, data.academic_year, 1]
                );
            }
        }
        
        console.log('College IDs imported successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to import college IDs:', error);
        process.exit(1);
    }
};

importIds();
