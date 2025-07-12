class App {
    constructor() {
        this.initializeComponents();
    }
    
    initializeComponents() {
        // Only initialize cat if element exists
        if (document.getElementById('cat')) {
            new ASCIICat();
        }

        // Initialize writer if on writer page
        if (document.getElementById('post-title')) {
            new BlogWriter();
        }
        
        // Always initialize random colors for links
        new RandomColors();
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new App();
});