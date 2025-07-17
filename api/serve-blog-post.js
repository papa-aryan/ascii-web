const SupabaseContentDatabase = require('../database/supabase-database');
const fs = require('fs');
const path = require('path');

let dbInstance = null;

function getDatabase() {
    if (!dbInstance) {
        dbInstance = new SupabaseContentDatabase();
    }
    return dbInstance;
}

/**
 * Format content with basic markdown-like syntax
 * @param {string} content - Raw content
 * @returns {string} - Formatted HTML content
 */
function formatContent(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

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

        const db = getDatabase();
        
        // Look up blog post in database by filename
        const blogPost = await db.getBlogPostByFilename(filename);
        
        if (!blogPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Read the template file
        const templatePath = path.join(process.cwd(), 'templates', 'blog-post-template.html');
        
        if (!fs.existsSync(templatePath)) {
            throw new Error('Blog post template not found');
        }
        
        const template = fs.readFileSync(templatePath, 'utf8');
        
        // Format the content and generate current date
        const htmlContent = formatContent(blogPost.content);
        const currentDate = new Date(blogPost.created_at).toISOString().split('T')[0];
        
        // Replace template placeholders
        const finalHtml = template
            .replace(/{{TITLE}}/g, blogPost.title)
            .replace(/{{DATE}}/g, currentDate)
            .replace(/{{CONTENT}}/g, htmlContent);
        
        // Set proper headers and return the generated HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        res.status(200).send(finalHtml);
        
    } catch (error) {
        console.error('Error serving blog post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 