/**
 * Frontend Authentication Manager
 * Handles login/logout, token storage, and auth state management
 */
class AuthManager {
    constructor() {
        this.user = null;
        this.token = null;
        this.tokenKey = 'admin_auth_token';
        this.userKey = 'admin_user_data';
        
        // Load existing session on initialization
        this.loadSession();
    }

    /**
     * Load session from localStorage
     */
    loadSession() {
        try {
            const token = localStorage.getItem(this.tokenKey);
            const userData = localStorage.getItem(this.userKey);
            
            if (token && userData) {
                this.token = token;
                this.user = JSON.parse(userData);
                
                // Verify token hasn't expired
                const user = JSON.parse(userData);
                if (user.expires_at && new Date(user.expires_at * 1000) <= new Date()) {
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.clearSession();
        }
    }

    /**
     * Save session to localStorage
     * @param {Object} authData - Authentication data from login
     */
    saveSession(authData) {
        try {
            this.token = authData.session.access_token;
            this.user = {
                ...authData.user,
                expires_at: authData.session.expires_at
            };
            
            localStorage.setItem(this.tokenKey, this.token);
            localStorage.setItem(this.userKey, JSON.stringify(this.user));
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    /**
     * Clear session from localStorage
     */
    clearSession() {
        this.token = null;
        this.user = null;
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Check if a token exists locally (does not verify with server)
     * @returns {boolean} - True if a token is stored
     */
    hasToken() {
        return !!this.token;
    }

    /**
     * Check if user is authenticated (alias for hasToken for semantic clarity)
     * @returns {boolean} - True if user is authenticated
     */
    isAuthenticated() {
        return this.hasToken();
    }

    /**
     * Verify session with the server
     * @returns {Promise<boolean>} - True if session is valid
     */
    async validateSession() {
        if (!this.hasToken()) {
            return false;
        }

        try {
            const response = await this.authenticatedFetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'validate' })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    return true;
                }
            }
            
            // If response is not ok or success is false, clear session
            this.clearSession();
            return false;
        } catch (error) {
            console.error('Session validation error:', error);
            this.clearSession();
            return false;
        }
    }

    /**
     * Login with email and password
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @returns {Promise<Object>} - Login result
     */
    async login(email, password) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'login',
                    email,
                    password
                })
            });

            const result = await response.json();

            if (result.success) {
                this.saveSession(result);
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    /**
     * Logout current user
     * @returns {Promise<Object>} - Logout result
     */
    async logout() {
        try {
            await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'logout'
                })
            });

            this.clearSession();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Clear session even if API call fails
            this.clearSession();
            return { success: true };
        }
    }

    /**
     * Get authorization header for API requests
     * @returns {Object} - Headers object with authorization
     */
    getAuthHeaders() {
        if (!this.token) {
            return {};
        }

        return {
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Make authenticated API request
     * @param {string} url - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} - Fetch response
     */
    async authenticatedFetch(url, options = {}) {
        const authHeaders = this.getAuthHeaders();
        
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                ...authHeaders
            }
        });
    }

    /**
     * Redirect to login if not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
}

// Make it available globally
window.AuthManager = AuthManager; 