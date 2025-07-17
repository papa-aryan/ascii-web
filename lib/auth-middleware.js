const AuthService = require('./auth-service');

/**
 * Authentication Middleware
 * Provides reusable auth checking functions for API endpoints
 */
class AuthMiddleware {
    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Middleware to require admin authentication
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @returns {Promise<Object|null>} - Returns user if authenticated, sends error response if not
     */
    async requireAdmin(req, res) {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ 
                    error: 'Unauthorized: Admin authentication required',
                    code: 'NO_AUTH_TOKEN'
                });
                return null;
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            
            // Verify admin session
            const user = await this.authService.verifyAdminSession(token);
            
            if (!user) {
                res.status(401).json({ 
                    error: 'Unauthorized: Invalid admin session',
                    code: 'INVALID_AUTH'
                });
                return null;
            }

            // Add user to request for use in handler
            req.user = user;
            return user;
            
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.status(500).json({ 
                error: 'Authentication service error',
                code: 'AUTH_SERVICE_ERROR'
            });
            return null;
        }
    }

    /**
     * Helper to wrap admin-only handlers
     * @param {Function} handler - The actual API handler function
     * @returns {Function} - Wrapped handler with auth protection
     */
    static withAdminAuth(handler) {
        return async (req, res) => {
            const middleware = new AuthMiddleware();
            const user = await middleware.requireAdmin(req, res);
            
            // If auth failed, response was already sent
            if (!user) {
                return;
            }

            // Call the original handler
            return await handler(req, res);
        };
    }
}

module.exports = AuthMiddleware; 