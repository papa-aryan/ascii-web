const { createClient } = require('@supabase/supabase-js');

class SupabaseContentDatabase {
    constructor() {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
        }
        
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        this.tableName = 'posts';
    }

    /**
     * Save a new draft
     * @param {string} title - Post title
     * @param {string} content - Post content  
     * @param {string} type - Content type ('blog' or 'journal')
     * @returns {Promise<number>} - The ID of the created draft
     */
    async saveDraft(title, content, type = 'blog') {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .insert([{
                title,
                content,
                type,
                status: 'draft'
            }])
            .select('id')
            .single();

        if (error) {
            throw new Error(`Failed to save draft: ${error.message}`);
        }

        return data.id;
    }

    /**
     * Get drafts, optionally filtered by type
     * @param {string|null} type - Optional content type filter
     * @returns {Promise<Array>} - Array of draft posts
     */
    async getDrafts(type = null) {
        let query = this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', 'draft')
            .order('updated_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to get drafts: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Update an existing draft
     * @param {number} id - Draft ID
     * @param {string} title - Updated title
     * @param {string} content - Updated content
     * @param {string} type - Content type
     * @returns {Promise<void>}
     */
    async updateDraft(id, title, content, type = 'blog') {
        const { error } = await this.supabase
            .from(this.tableName)
            .update({
                title,
                content,
                type,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('status', 'draft');

        if (error) {
            throw new Error(`Failed to update draft: ${error.message}`);
        }
    }

    /**
     * Delete a draft
     * @param {number} id - Draft ID
     * @returns {Promise<void>}
     */
    async deleteDraft(id) {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)
            .eq('status', 'draft');

        if (error) {
            throw new Error(`Failed to delete draft: ${error.message}`);
        }
    }

    /**
     * Publish a blog post
     * @param {string} title - Blog post title
     * @param {string} content - Blog post content
     * @param {string} filename - Generated HTML filename
     * @returns {Promise<number>} - The ID of the published blog post
     */
    async publishBlogPost(title, content, filename) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .insert([{
                title,
                content,
                type: 'blog',
                status: 'published',
                filename: filename
            }])
            .select('id')
            .single();

        if (error) {
            throw new Error(`Failed to publish blog post: ${error.message}`);
        }

        return data.id;
    }

    /**
     * Get all published blog posts
     * @returns {Promise<Array>} - Array of published blog posts
     */
    async getAllPublishedBlogPosts() {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', 'published')
            .eq('type', 'blog')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get published blog posts: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get a specific blog post by ID
     * @param {number} id - Blog post ID
     * @returns {Promise<Object|null>} - Blog post or null if not found
     */
    async getBlogPost(id) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .eq('type', 'blog')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Not found
                return null;
            }
            throw new Error(`Failed to get blog post: ${error.message}`);
        }

        return data;
    }

    /**
     * Get a blog post by filename
     * @param {string} filename - Blog post filename (without .html extension)
     * @returns {Promise<Object|null>} - Blog post or null if not found
     */
    async getBlogPostByFilename(filename) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('filename', `${filename}.html`)
            .eq('type', 'blog')
            .eq('status', 'published')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Not found
                return null;
            }
            throw new Error(`Failed to get blog post by filename: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete a published blog post
     * @param {number} id - Blog post ID
     * @returns {Promise<void>}
     */
    async deleteBlogPost(id) {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)
            .eq('type', 'blog')
            .eq('status', 'published');

        if (error) {
            throw new Error(`Failed to delete blog post: ${error.message}`);
        }
    }

    /**
     * Publish a journal entry
     * @param {string} title - Journal title
     * @param {string} content - Journal content
     * @returns {Promise<number>} - The ID of the published journal
     */
    async publishJournal(title, content) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .insert([{
                title,
                content,
                type: 'journal',
                status: 'published'
            }])
            .select('id')
            .single();

        if (error) {
            throw new Error(`Failed to publish journal: ${error.message}`);
        }

        return data.id;
    }

    /**
     * Get all published journals
     * @returns {Promise<Array>} - Array of published journal entries
     */
    async getAllPublishedJournals() {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', 'published')
            .eq('type', 'journal')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get published journals: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get a specific journal by ID
     * @param {number} id - Journal ID
     * @returns {Promise<Object|null>} - Journal entry or null if not found
     */
    async getJournal(id) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .eq('type', 'journal')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Not found
                return null;
            }
            throw new Error(`Failed to get journal: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete a published journal
     * @param {number} id - Journal ID
     * @returns {Promise<void>}
     */
    async deleteJournal(id) {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)
            .eq('type', 'journal')
            .eq('status', 'published');

        if (error) {
            throw new Error(`Failed to delete journal: ${error.message}`);
        }
    }

    /**
     * Close database connection (no-op for Supabase)
     */
    close() {
        // Supabase doesn't require explicit connection closing
    }
}

module.exports = SupabaseContentDatabase; 