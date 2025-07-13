const express = require('express');
const ContentDatabase = require('./database/database.js');
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
        this.db = new ContentDatabase();
        this.blogManager = new BlogHTMLManager(path.join(__dirname, 'blog.html'));
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('.'));
    }
    
    setupRoutes() {

        // Get drafts with optional type filter
        this.app.get('/api/drafts', (req, res) => {
            const type = req.query.type;
            
            this.db.getDrafts(type, (err, drafts) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json(drafts);
                }
            });
        });

        // Update POST /api/drafts to include type
        this.app.post('/api/drafts', (req, res) => {
            const { title, content, id, type = 'blog' } = req.body;

            if (id) {
                this.db.updateDraft(id, title, content, type, (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    } else {
                        res.json({ success: true, id });
                    }
                });
            } else {
                this.db.saveDraft(title, content, type, (err, id) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    } else {
                        res.json({ success: true, id });
                    }
                });
            }
        });        

        // Update publish endpoint to handle minis
        this.app.post('/api/publish', (req, res) => {
            const { title, content, filename, htmlContent, type = 'blog' } = req.body;
            
            try {
                if (type === 'blog') {
                    // Existing blog post publishing logic
                    const filePath = path.join(__dirname, 'blogposts', filename);
                    fs.writeFileSync(filePath, htmlContent);
                    
                    this.blogManager.addPostToTop(filename, title);
                    
                    res.json({ success: true });
                } else if (type === 'mini') {
                    // Publish mini to database
                    this.db.publishMini(title, content, (err, id) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                        } else {
                            res.json({ success: true, id });
                        }
                    });
                } else {
                    res.status(400).json({ error: 'Invalid content type' });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Get all published minis
        this.app.get('/api/minis', (req, res) => {
            this.db.getAllPublishedMinis((err, minis) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json(minis);
                }
            });
        });

        // Get specific mini by ID
        this.app.get('/api/minis/:id', (req, res) => {
            this.db.getMini(req.params.id, (err, mini) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else if (!mini) {
                    res.status(404).json({ error: 'Mini not found' });
                } else {
                    res.json(mini);
                }
            });
        });

        // Delete published mini
        this.app.delete('/api/minis/:id', (req, res) => {
            this.db.deleteMini(req.params.id, (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true });
                }
            });
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