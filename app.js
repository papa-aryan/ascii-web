class App {
    constructor() {
        this.initializeComponents();
    }
    
    async initializeComponents() {
        // Initialize page load manager for pages that need loading coordination
        let pageLoadManager = null;
        const needsLoadingCoordination = window.location.pathname.includes('blog.html') || 
                                       window.location.pathname.includes('journal.html');
        
        if (needsLoadingCoordination && window.PageLoadManager) {
            pageLoadManager = new window.PageLoadManager();
        }

        // Initialize cat if element exists
        if (document.getElementById('cat')) {
            new ASCIICat();
        }
        
        // Initialize duck if element exists
        if (document.getElementById('duck')) {
            const duck = new ASCIIDuck();
            
            // Enable duck movement only on the main blog page (not in posts)
            const currentPage = window.location.pathname;
            if (currentPage.endsWith('blog.html') || currentPage.endsWith('/blog')) {
                duck.enableMovement();
            }
        }

        // Initialize writer if on writer page
        if (document.getElementById('post-title')) {
            new BlogWriter();
        }
        
        // Initialize journal manager on journal page
        if (window.location.pathname.includes('journal.html')) {
            new JournalManager(pageLoadManager);
        }

        // Initialize blog loader for dynamic blog post listing
        if (window.BlogLoader) {
            const blogLoader = new window.BlogLoader(pageLoadManager);
            await blogLoader.init();
        }

        // Initialize authentication checker for conditional element visibility
        if (window.AuthChecker) {
            const authChecker = new window.AuthChecker(pageLoadManager);
            await authChecker.initializePageAuth();
        }
        
        // Always initialize random colors for links
        new RandomColors();
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new App();
});