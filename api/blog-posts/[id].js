const SupabaseContentDatabase = require('../../database/supabase-database');
const AuthMiddleware = require('../../lib/auth-middleware');

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
            return res.status(400).json({ error: 'Blog post ID is required' });
        }

        if (req.method === 'GET') {
            // Public read access
            const blogPost = await db.getBlogPost(parseInt(id, 10));
            
            if (!blogPost) {
                return res.status(404).json({ error: 'Blog post not found' });
            }
            
            res.status(200).json(blogPost);
            
        } else if (req.method === 'DELETE') {
            // Admin-only delete - check auth manually
            const authMiddleware = new AuthMiddleware();
            const user = await authMiddleware.requireAdmin(req, res);
            
            // If auth failed, response was already sent
            if (!user) {
                return;
            }

            // Proceed with delete using authenticated context
            const accessToken = req.accessToken;
            await db.deleteBlogPost(parseInt(id, 10), accessToken);
            res.status(200).json({ success: true });
            
        } else {
            res.setHeader('Allow', ['GET', 'DELETE']);
            res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
}; 