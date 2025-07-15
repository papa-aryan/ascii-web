class App {
    constructor() {
        this.initializeComponents();
    }
    
    initializeComponents() {
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
            new JournalManager();
        }
        
        // Always initialize random colors for links
        new RandomColors();
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new App();
});