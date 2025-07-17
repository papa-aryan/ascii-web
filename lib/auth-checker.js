/**
 * Authentication Checker Utility
 * Handles conditional display of admin-only elements
 */
class AuthChecker {
    constructor(pageLoadManager = null) {
        this.authManager = new AuthManager();
        this.pageLoadManager = pageLoadManager;
    }

    /**
     * Show admin-only elements if user is authenticated
     * @param {string} selector - CSS selector for elements to show
     */
    showIfAuthenticated(selector) {
        const elements = document.querySelectorAll(selector);
        
        if (this.authManager.isAuthenticated()) {
            elements.forEach(element => {
                element.classList.add('authenticated');
            });
        }
    }

    /**
     * Initialize auth-based element visibility for current page
     * @returns {Promise<void>} - Resolves when auth check is complete
     */
    async initializePageAuth() {
        // Register this operation with the page load manager
        if (this.pageLoadManager) {
            this.pageLoadManager.addPendingOperation('auth-check');
        }

        try {
            // Show admin-only elements if authenticated
            this.showIfAuthenticated('.admin-only');
            
            // Complete the auth check operation
            if (this.pageLoadManager) {
                this.pageLoadManager.completePendingOperation('auth-check');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            
            // Complete the operation even on error
            if (this.pageLoadManager) {
                this.pageLoadManager.completePendingOperation('auth-check');
            }
        }
    }
}

// Make it available globally
window.AuthChecker = AuthChecker; 