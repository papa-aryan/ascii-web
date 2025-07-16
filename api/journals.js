const SupabaseContentDatabase = require('../database/supabase-database');

let dbInstance = null;

function getDatabase() {
    if (!dbInstance) {
        dbInstance = new SupabaseContentDatabase();
    }
    return dbInstance;
}

module.exports = async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
        }

        const db = getDatabase();
        const journals = await db.getAllPublishedJournals();
        
        res.status(200).json(journals);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
} 