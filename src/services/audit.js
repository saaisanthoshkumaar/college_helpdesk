const { dbRun } = require('../database/connection');

const logActivity = async (adminId, action, entityType, entityId = null, metadata = null) => {
    try {
        const metadataStr = metadata ? JSON.stringify(metadata) : null;
        await dbRun(
            'INSERT INTO admin_activity (admin_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?)',
            [adminId, action, entityType, entityId, metadataStr]
        );
    } catch (error) {
        console.error('Failed to log admin activity:', error);
    }
};

module.exports = {
    logActivity
};
