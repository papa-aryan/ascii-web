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
        const db = getDatabase();

        if (req.method === 'GET') {
            // Get drafts with optional type filter
            const type = req.query.type || null;
            const drafts = await db.getDrafts(type);
            res.status(200).json(drafts);
            
        } else if (req.method === 'POST') {
            // Save or update draft
            const { title, content, id, type = 'blog' } = req.body;

            if (!title && !content) {
                return res.status(400).json({ error: 'Title or content is required' });
            }

            if (id) {
                // Update existing draft
                await db.updateDraft(id, title, content, type);
                res.status(200).json({ success: true, id });
            } else {
                // Create new draft
                const newId = await db.saveDraft(title, content, type);
                res.status(201).json({ success: true, id: newId });
            }
            
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
} 