const { createClient } = require('@supabase/supabase-js');

/**
 * Authentication Service for Supabase
 * Handles all authentication-related operations
 */
class AuthService {
    constructor() {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
        }
        
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
    }

    /**
     * Verify if a user session is valid and belongs to admin
     * @param {string} accessToken - JWT access token from client
     * @returns {Promise<Object|null>} - User object if valid admin, null otherwise
     */
    async verifyAdminSession(accessToken) {
        try {
            if (!accessToken) {
                return null;
            }

            // Verify the JWT token with Supabase
            const { data: { user }, error } = await this.supabase.auth.getUser(accessToken);
            
            if (error || !user) {
                return null;
            }

            // Check if user is the admin (you'll replace this email with your admin email)
            const isAdmin = user.email === process.env.ADMIN_EMAIL;
            
            return isAdmin ? user : null;
        } catch (error) {
            console.error('Auth verification error:', error);
            return null;
        }
    }

    /**
     * Sign in with email and password
     * @param {string} email - Admin email
     * @param {string} password - Admin password  
     * @returns {Promise<Object>} - Auth result
     */
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw new Error(error.message);
            }

            // Verify this is the admin user
            if (data.user.email !== process.env.ADMIN_EMAIL) {
                await this.supabase.auth.signOut();
                throw new Error('Unauthorized: Admin access only');
            }

            return {
                success: true,
                user: data.user,
                session: data.session
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sign out current user
     * @returns {Promise<Object>} - Signout result
     */
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                throw new Error(error.message);
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get current session
     * @returns {Promise<Object|null>} - Current session or null
     */
    async getCurrentSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                throw new Error(error.message);
            }

            return session;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }
}

module.exports = AuthService; 