const SupabaseContentDatabase = require('../database/supabase-database');
const ContentPublisher = require('../lib/content-publisher');
const AuthMiddleware = require('../lib/auth-middleware');

let dbInstance = null;
let publisherInstance = null;

function getDatabase() {
    if (!dbInstance) {
        dbInstance = new SupabaseContentDatabase();
    }
    return dbInstance;
}

function getPublisher() {
    if (!publisherInstance) {
        publisherInstance = new ContentPublisher(getDatabase());
    }
    return publisherInstance;
}

// Original handler function
async function publishHandler(req, res) {
    try {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
        }

        const { title, content, type } = req.body;
        const accessToken = req.accessToken; // Get token from auth middleware

        if (!title || !content || !type) {
            return res.status(400).json({ 
                error: 'Title, content, and type are required' 
            });
        }

        if (!['blog', 'journal'].includes(type)) {
            return res.status(400).json({ 
                error: 'Type must be either "blog" or "journal"' 
            });
        }

        const publisher = getPublisher();
        const result = await publisher.publish({ title, content, type }, accessToken);

        res.status(200).json(result);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
}

// Export the protected handler
module.exports = AuthMiddleware.withAdminAuth(publishHandler); 