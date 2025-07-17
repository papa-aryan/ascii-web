/**
 * Page Load Manager
 * Coordinates content loading and manages loading states across pages
 */
class PageLoadManager {
    constructor() {
        this.isLoading = true;
        this.pendingOperations = new Set();
        this.loadingIndicator = null;
        this.contentContainer = null;
        
        this.initializeLoadingUI();
        this.setupSafetyTimeout();
    }

    /**
     * Initialize the loading UI elements
     */
    initializeLoadingUI() {
        // Find the content container (usually .menu-text)
        this.contentContainer = document.querySelector('.menu-text');
        
        if (this.contentContainer) {
            // Add loading class to hide links
            this.contentContainer.classList.add('content-loading');
            
            // Create and add loading indicator
            this.loadingIndicator = document.createElement('div');
            this.loadingIndicator.className = 'loading-indicator';
            this.loadingIndicator.textContent = 'one sec...';
            
            // Insert after the description paragraph
            const description = this.contentContainer.querySelector('p');
            if (description) {
                description.parentNode.insertBefore(this.loadingIndicator, description.nextSibling);
            } else {
                this.contentContainer.appendChild(this.loadingIndicator);
            }
        }
    }

    /**
     * Register a pending operation
     * @param {string} operationId - Unique identifier for the operation
     */
    addPendingOperation(operationId) {
        this.pendingOperations.add(operationId);
    }

    /**
     * Mark an operation as complete
     * @param {string} operationId - Unique identifier for the operation
     */
    completePendingOperation(operationId) {
        this.pendingOperations.delete(operationId);
        
        // Check if all operations are complete
        if (this.pendingOperations.size === 0) {
            this.finishLoading();
        }
    }

    /**
     * Complete the loading process and show content
     */
    finishLoading() {
        if (!this.isLoading) return;
        
        this.isLoading = false;
        
        // Remove loading-page class from body to show all links
        document.body.classList.remove('loading-page');
        
        if (this.contentContainer) {
            // Remove loading class to show links
            this.contentContainer.classList.remove('content-loading');
        }
        
        if (this.loadingIndicator) {
            this.loadingIndicator.remove();
            this.loadingIndicator = null;
        }
    }

    /**
     * Check if page is currently loading
     * @returns {boolean} - True if still loading
     */
    isPageLoading() {
        return this.isLoading;
    }

    /**
     * Setup safety timeout to prevent indefinite loading state
     */
    setupSafetyTimeout() {
        // Force finish loading after 10 seconds as a safety measure
        setTimeout(() => {
            if (this.isLoading) {
                console.warn('PageLoadManager: Forcing finish loading due to timeout');
                this.forceFinishLoading();
            }
        }, 10000);
    }

    /**
     * Force finish loading (for error cases or timeouts)
     */
    forceFinishLoading() {
        this.pendingOperations.clear();
        this.finishLoading();
    }
}

// Make it available globally
window.PageLoadManager = PageLoadManager;

// Safety fallback: if a page has loading-page class but no PageLoadManager is created,
// remove the loading-page class after a reasonable timeout
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('loading-page')) {
        setTimeout(() => {
            if (document.body.classList.contains('loading-page')) {
                console.warn('PageLoadManager: Safety fallback - removing loading-page class');
                document.body.classList.remove('loading-page');
            }
        }, 8000); // 8 seconds safety timeout
    }
}); 