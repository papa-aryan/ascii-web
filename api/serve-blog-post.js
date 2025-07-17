const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
    try {
        const { filename } = req.query;
        
        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        // Security check: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        // Construct file path
        const filePath = path.join(process.cwd(), 'blogposts', `${filename}.html`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Read and serve the HTML file
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        
        // Set proper headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        res.status(200).send(htmlContent);
        
    } catch (error) {
        console.error('Error serving blog post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 