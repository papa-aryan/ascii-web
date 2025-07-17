require('dotenv').config();
const SupabaseContentDatabase = require('./database/supabase-database.js');

const command = process.argv[2];
const type = process.argv[3];
const id = process.argv[4];

function printHelp() {
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

Note: Make sure your .env file contains SUPABASE_URL and SUPABASE_ANON_KEY
    `);
}

async function listContent(contentType) {
    const db = new SupabaseContentDatabase();
    
    try {
        if (contentType === 'journal') {
            const items = await db.getAllPublishedJournals();
            console.log(`--- Published Journals ---`);
            if (items.length === 0) {
                console.log('No published journals found.');
            } else {
                items.forEach(item => console.log(`ID: ${item.id}, Title: ${item.title}`));
            }
        } else if (contentType === 'blog') {
            const items = await db.getAllPublishedBlogPosts();
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
        console.error('Error:', error.message);
    } finally {
        db.close();
    }
}

async function deleteContent(contentType, contentId) {
    if (!contentId) {
        console.error('Error: Please provide an ID to delete.');
        return;
    }

    const db = new SupabaseContentDatabase();
    
    try {
        const parsedId = parseInt(contentId, 10);
        
        if (contentType === 'journal') {
            // First check if the journal exists
            const journal = await db.getJournal(parsedId);
            if (!journal) {
                console.log(`No journal found with ID ${contentId}.`);
                return;
            }
            
            // Delete the journal
            await db.deleteJournal(parsedId);
            console.log(`Journal with ID ${contentId} has been deleted.`);
            
        } else if (contentType === 'blog') {
            // First check if the blog post exists
            const blogPost = await db.getBlogPost(parsedId);
            if (!blogPost) {
                console.log(`No blog post found with ID ${contentId}.`);
                return;
            }
            
            // Delete the blog post
            await db.deleteBlogPost(parsedId);
            console.log(`Blog post with ID ${contentId} has been deleted.`);
            console.log(`Note: HTML file '${blogPost.filename}' may still exist in /blogposts folder.`);
            
        } else {
            console.log("Supported types: 'blog' or 'journal'");
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        db.close();
    }
}

async function main() {
    try {
        if (command === 'list') {
            await listContent(type);
        } else if (command === 'delete') {
            await deleteContent(type, id);
        } else {
            printHelp();
        }
    } catch (error) {
        console.error('Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();