const express = require('express');
const BlogDatabase = require('./database/database.js');
const fs = require('fs');
const path = require('path');

class BlogHTMLManager {
    constructor(blogFilePath) {
        this.blogFilePath = blogFilePath;
    }
    
addPostToTop(filename, title) {
    try {
        const blogContent = fs.readFileSync(this.blogFilePath, 'utf8');
        const newPostHtml = `<div class="ascii-link"><a href="blogposts/${filename}">${title}</a></div>`;
        
        // Find the blog-posts div and first post
        const blogPostsOpenTag = '<div class="blog-posts">';
        const blogPostsStart = blogContent.indexOf(blogPostsOpenTag);
        const afterOpenTag = blogPostsStart + blogPostsOpenTag.length;
        const firstPostStart = blogContent.indexOf('<div class="ascii-link">', afterOpenTag);
        
        // Insert new post at the top
        const updatedContent = 
            blogContent.slice(0, firstPostStart) + 
            newPostHtml + '\n                ' +
            blogContent.slice(firstPostStart);
        
        fs.writeFileSync(this.blogFilePath, updatedContent);
        return true;
    } catch (error) {
        console.error(`Error adding post to blog: ${error.message}`);
        throw error;
    }
}
}

class BlogServer {
    constructor() {
        this.app = express();
        this.db = new BlogDatabase();
        this.blogManager = new BlogHTMLManager(path.join(__dirname, 'blog.html'));
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('.'));
    }
    
    setupRoutes() {
        // Get all drafts
        this.app.get('/api/drafts', (req, res) => {
            this.db.getAllDrafts((err, drafts) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json(drafts);
                }
            });
        });
        
        // Save new draft
        this.app.post('/api/publish', (req, res) => {
            const { title, content, filename, htmlContent } = req.body;
            
            try {
                const filePath = path.join(__dirname, 'blogposts', filename);
                fs.writeFileSync(filePath, htmlContent);
                
                this.blogManager.addPostToTop(filename, title);
                
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });    

        // Delete draft
        this.app.delete('/api/drafts/:id', (req, res) => {
            this.db.deleteDraft(req.params.id, (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true });
                }
            });
        });
    }
    
    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`Blog server running on http://localhost:${port}`);
        });
    }
}

// Start server
new BlogServer().start();