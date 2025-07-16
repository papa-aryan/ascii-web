const SupabaseContentDatabase = require('../../database/supabase-database');

let dbInstance = null;

function getDatabase() {
    if (!dbInstance) {
        dbInstance = new SupabaseContentDatabase();
    }
    return dbInstance;
}

module.exports = async function handler(req, res) {
    try {
        const db = getDatabase();
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Draft ID is required' });
        }

        if (req.method === 'DELETE') {
            await db.deleteDraft(parseInt(id, 10));
            res.status(200).json({ success: true });
            
        } else {
            res.setHeader('Allow', ['DELETE']);
            res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
} 