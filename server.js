const express = require('express');
const ContentDatabase = require('./database/database.js');
const fs = require('fs');
const path = require('path');

class ContentPublisher {
    constructor(db) {
        this.db = db;
        this.blogTemplatePath = path.join(__dirname, 'templates', 'blog-post-template.html');
    }

    publish(postData, callback) {
        const { title, content, type } = postData;

        if (type === 'blog') {
            this.publishBlogPost(title, content, callback);
        } else if (type === 'mini') {
            this.publishMini(title, content, callback);
        } else {
            callback(new Error('Invalid content type'));
        }
    }

    publishBlogPost(title, content, callback) {
        try {
            const template = fs.readFileSync(this.blogTemplatePath, 'utf8');
            const currentDate = new Date().toISOString().split('T')[0];
            
            const htmlContent = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');

            const finalHtml = template
                .replace(/{{TITLE}}/g, title)
                .replace(/{{DATE}}/g, currentDate)
                .replace(/{{CONTENT}}/g, htmlContent);

            const filename = this.generateFilename(title);
            const filePath = path.join(__dirname, 'blogposts', filename);
            
            fs.writeFileSync(filePath, finalHtml);
            this.addPostToBlogList(filename, title);

            callback(null, { success: true });
        } catch (error) {
            callback(error);
        }
    }

    publishMini(title, content, callback) {
        this.db.publishMini(title, content, (err, id) => {
            if (err) {
                return callback(err);
            }
            callback(null, { success: true, id });
        });
    }
    
    generateFilename(title) {
        return title.toLowerCase()
                   .replace(/[^a-z0-9\s]/g, '')
                   .replace(/\s+/g, '-')
                   .substring(0, 50) + '.html';
    }

    addPostToBlogList(filename, title) {
        const blogFilePath = path.join(__dirname, 'blog.html');
        const blogContent = fs.readFileSync(blogFilePath, 'utf8');
        const newPostHtml = `                <div class="ascii-link"><a href="blogposts/${filename}">${title}</a></div>`;

        const blogPostsOpenTag = '<div class="blog-posts">';
        const blogPostsStart = blogContent.indexOf(blogPostsOpenTag);
        
        if (blogPostsStart === -1) {
            throw new Error('Could not find blog posts container in blog.html');
        }

        const afterOpenTag = blogPostsStart + blogPostsOpenTag.length;
        
        const firstPostStart = blogContent.indexOf('<div class="ascii-link">', afterOpenTag);

        let updatedContent;
        if (firstPostStart !== -1) {
            updatedContent = 
                blogContent.slice(0, firstPostStart) + 
                newPostHtml + '\n' +
                blogContent.slice(firstPostStart);
        } else {
            updatedContent = 
                blogContent.slice(0, afterOpenTag) + '\n' +
                newPostHtml + '\n' +
                blogContent.slice(afterOpenTag);
        }
        
        fs.writeFileSync(blogFilePath, updatedContent);
    }
}

class BlogServer {
    constructor() {
        this.app = express();
        this.db = new ContentDatabase();
        this.publisher = new ContentPublisher(this.db);
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
            this.publisher.publish(req.body, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json(result);
                }
            });
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