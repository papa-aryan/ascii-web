const path = require('path');

class ContentPublisher {
    constructor(database) {
        this.db = database;
        // Remove the template path since we won't be creating files
    }

    /**
     * Publish content based on type
     * @param {Object} postData - Post data containing title, content, and type
     * @param {string} accessToken - JWT access token for authenticated admin operations
     * @returns {Promise<Object>} - Result object with success status and optional id
     */
    async publish(postData, accessToken = null) {
        const { title, content, type } = postData;

        if (!title || !content || !type) {
            throw new Error('Title, content, and type are required');
        }

        if (type === 'blog') {
            return await this.publishBlogPost(title, content, accessToken);
        } else if (type === 'journal') {
            return await this.publishJournal(title, content, accessToken);
        } else {
            throw new Error('Invalid content type. Must be "blog" or "journal"');
        }
    }

    /**
     * Publish a blog post (saves to database only - HTML generated dynamically)
     * @param {string} title - Blog post title
     * @param {string} content - Blog post content
     * @param {string} accessToken - JWT access token for authenticated admin operations
     * @returns {Promise<Object>} - Success result with blog post ID
     */
    async publishBlogPost(title, content, accessToken = null) {
        try {
            // Generate filename for URL routing
            const filename = this.generateFilename(title);
            
            // Save to database only - no file creation needed
            const id = await this.db.publishBlogPost(title, content, filename, accessToken);

            return { success: true, id };
        } catch (error) {
            throw new Error(`Failed to publish blog post: ${error.message}`);
        }
    }

    /**
     * Publish a journal entry (saves to database only)
     * @param {string} title - Journal title
     * @param {string} content - Journal content
     * @param {string} accessToken - JWT access token for authenticated admin operations
     * @returns {Promise<Object>} - Success result with journal ID
     */
    async publishJournal(title, content, accessToken = null) {
        try {
            const id = await this.db.publishJournal(title, content, accessToken);
            return { success: true, id };
        } catch (error) {
            throw new Error(`Failed to publish journal: ${error.message}`);
        }
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