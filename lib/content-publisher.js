const fs = require('fs');
const path = require('path');

class ContentPublisher {
    constructor(database) {
        this.db = database;
        this.blogTemplatePath = path.join(process.cwd(), 'templates', 'blog-post-template.html');
    }

    /**
     * Publish content based on type
     * @param {Object} postData - Post data containing title, content, and type
     * @returns {Promise<Object>} - Result object with success status and optional id
     */
    async publish(postData) {
        const { title, content, type } = postData;

        if (!title || !content || !type) {
            throw new Error('Title, content, and type are required');
        }

        if (type === 'blog') {
            return await this.publishBlogPost(title, content);
        } else if (type === 'journal') {
            return await this.publishJournal(title, content);
        } else {
            throw new Error('Invalid content type. Must be "blog" or "journal"');
        }
    }

    /**
     * Publish a blog post (saves to database AND creates HTML file)
     * @param {string} title - Blog post title
     * @param {string} content - Blog post content
     * @returns {Promise<Object>} - Success result with blog post ID
     */
    async publishBlogPost(title, content) {
        try {
            // Generate filename first
            const filename = this.generateFilename(title);
            
            // Save to database FIRST
            const id = await this.db.publishBlogPost(title, content, filename);
            
            // Then create HTML file
            const template = fs.readFileSync(this.blogTemplatePath, 'utf8');
            const currentDate = new Date().toISOString().split('T')[0];
            
            // Convert markdown-like formatting to HTML
            const htmlContent = this.formatContent(content);

            // Replace template placeholders
            const finalHtml = template
                .replace(/{{TITLE}}/g, title)
                .replace(/{{DATE}}/g, currentDate)
                .replace(/{{CONTENT}}/g, htmlContent);

            // Save HTML file
            const filePath = path.join(process.cwd(), 'blogposts', filename);
            fs.writeFileSync(filePath, finalHtml);

            return { success: true, id };
        } catch (error) {
            throw new Error(`Failed to publish blog post: ${error.message}`);
        }
    }

    /**
     * Publish a journal entry (saves to database only)
     * @param {string} title - Journal title
     * @param {string} content - Journal content
     * @returns {Promise<Object>} - Success result with journal ID
     */
    async publishJournal(title, content) {
        try {
            const id = await this.db.publishJournal(title, content);
            return { success: true, id };
        } catch (error) {
            throw new Error(`Failed to publish journal: ${error.message}`);
        }
    }

    /**
     * Format content with basic markdown-like syntax
     * @param {string} content - Raw content
     * @returns {string} - Formatted HTML content
     */
    formatContent(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
    
    /**
     * Generate a URL-friendly filename from title
     * @param {string} title - Post title
     * @returns {string} - Generated filename
     */
    generateFilename(title) {
        return title.toLowerCase()
                   .replace(/[^a-z0-9\s]/g, '')
                   .replace(/\s+/g, '-')
                   .substring(0, 50) + '.html';
    }
}

module.exports = ContentPublisher; 