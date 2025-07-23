require('dotenv').config();
const SupabaseContentDatabase = require('./database/supabase-database.js');
const AuthService = require('./lib/auth-service.js');

class ContentManager {
    constructor() {
        this.db = new SupabaseContentDatabase();
        this.authService = new AuthService();
        this.accessToken = null;
        this.isAuthenticated = false;
    }

    /**
     * Authenticate as admin user
     * @returns {Promise<boolean>} - True if authentication successful
     */
    async authenticate() {
        if (this.isAuthenticated) {
            return true;
        }

        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
        }

        try {
            const result = await this.authService.signIn(
                process.env.ADMIN_EMAIL,
                process.env.ADMIN_PASSWORD
            );

            if (!result.success) {
                throw new Error(`Authentication failed: ${result.error}`);
            }

            this.accessToken = result.session.access_token;
            this.isAuthenticated = true;
            console.log('✅ Admin authentication successful');
            return true;

        } catch (error) {
            console.error('❌ Authentication failed:', error.message);
            return false;
        }
    }

    /**
     * List content of specified type
     * @param {string} contentType - 'blog' or 'journal'
     */
    async listContent(contentType) {
        try {
            if (contentType === 'journal') {
                const items = await this.db.getAllPublishedJournals();
                console.log(`--- Published Journals ---`);
                if (items.length === 0) {
                    console.log('No published journals found.');
                } else {
                    items.forEach(item => console.log(`ID: ${item.id}, Title: ${item.title}`));
                }
            } else if (contentType === 'blog') {
                const items = await this.db.getAllPublishedBlogPosts();
                console.log(`--- Published Blog Posts ---`);
                if (items.length === 0) {
                    console.log('No published blog posts found.');
                } else {
                    items.forEach(item => console.log(`ID: ${item.id}, Title: ${item.title}, File: ${item.filename || 'N/A'}`));
                }
            } else {
                console.log("Supported types: 'blog' or 'journal'");
            }
        } catch (error) {
            console.error('❌ Error listing content:', error.message);
        }
    }

    /**
     * Delete content with admin authentication
     * @param {string} contentType - 'blog' or 'journal'
     * @param {string} contentId - ID of content to delete
     */
    async deleteContent(contentType, contentId) {
        if (!contentId) {
            console.error('❌ Error: Please provide an ID to delete.');
            return;
        }

        // Ensure we're authenticated for delete operations
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
            console.error('❌ Cannot delete content: Authentication failed');
            return;
        }

        try {
            const parsedId = parseInt(contentId, 10);
            
            if (contentType === 'journal') {
                // First check if the journal exists
                const journal = await this.db.getJournal(parsedId);
                if (!journal) {
                    console.log(`No journal found with ID ${contentId}.`);
                    return;
                }
                
                // Delete with admin authentication
                await this.db.deleteJournal(parsedId, this.accessToken);
                console.log(`✅ Journal with ID ${contentId} has been deleted.`);
                
            } else if (contentType === 'blog') {
                // First check if the blog post exists
                const blogPost = await this.db.getBlogPost(parsedId);
                if (!blogPost) {
                    console.log(`No blog post found with ID ${contentId}.`);
                    return;
                }
                
                // Delete with admin authentication
                await this.db.deleteBlogPost(parsedId, this.accessToken);
                console.log(`✅ Blog post with ID ${contentId} has been deleted.`);            
            } else {
                console.log("Supported types: 'blog' or 'journal'");
            }
        } catch (error) {
            console.error('❌ Error deleting content:', error.message);
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.db.close();
    }

    /**
     * Print help information
     */
    static printHelp() {
        console.log(`
Content Management Script
-------------------------
Usage:
  node manage-content.js list <type>      - Lists all published posts of a type ('blog' or 'journal').
  node manage-content.js delete <type> <id> - Deletes a specific post by its ID.

Examples:
  node manage-content.js list journal
  node manage-content.js list blog
  node manage-content.js delete journal 12
  node manage-content.js delete blog 5

Environment Variables Required:
  SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
        `);
    }
}

// Script execution
async function main() {
    const command = process.argv[2];
    const type = process.argv[3];
    const id = process.argv[4];

    const manager = new ContentManager();

    try {
        if (command === 'list') {
            await manager.listContent(type);
        } else if (command === 'delete') {
            await manager.deleteContent(type, id);
        } else {
            ContentManager.printHelp();
        }
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    } finally {
        manager.cleanup();
    }
}

// Run the script
main();