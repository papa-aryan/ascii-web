class ASCIIDuck extends ASCIIArt {
    constructor() {
        super('duck'); // Pass the element ID to the parent constructor
        this.moveEnabled = false;
        this.position = null;
        
        // Set initial random position based on page type
        this.initializePosition();
    }
    
    getArt(flapping = false) {
        const wing = flapping ? '/\\' : '__';
        return `
${wing}
  <(o )___
   ( ._> /
   \`---'`;
    }
    
    initializePosition() {
        if (!this.element) return;
        
        const container = this.element.parentElement;
        const currentPage = window.location.pathname;
        
        // Define bounds based on page type
        let xMin, xMax;
        
        if (currentPage.endsWith('blog.html') || currentPage.endsWith('/blog')) {
            // On main blog page - position on right side
            xMin = 55;
            xMax = 85;
        } else {
            // On blog post pages - position on left side
            xMin = 15;
            xMax = 35;
        }
        
        // Random initial position within allowed bounds
        const randomX = xMin + Math.random() * (xMax - xMin);
        const randomY = 10 + Math.random() * 40; // Between 10-50vh
        
        // Set initial position
        container.style.top = `${randomY}vh`;
        container.style.left = `${randomX}%`;
        
        // Store position for later movement
        this.position = {
            x: randomX,
            y: randomY
        };
    }

    enableMovement() {
        this.moveEnabled = true;
        this.moveInterval = setInterval(() => this.randomMove(), 2000);
    }
    
    randomMove() {
        if (!this.moveEnabled || !this.position) return;
        
        // current page to determine bounds
        const currentPage = window.location.pathname;
        let xMin, xMax;
        
        if (currentPage.endsWith('blog.html') || currentPage.endsWith('/blog')) {
            xMin = 50;
            xMax = 85;
        } else {
            xMin = 10;
            xMax = 40;
        }
        
        // Move randomly within page-specific bounds
        this.position.x = Math.max(xMin, Math.min(xMax, this.position.x + (Math.random() * 20 - 10)));
        this.position.y = Math.max(5, Math.min(50, this.position.y + (Math.random() * 10 - 5)));
        
        // Update position
        if (this.element) {
            this.element.parentElement.style.top = `${this.position.y}vh`;
            this.element.parentElement.style.left = `${this.position.x}%`;
        }
    }
}