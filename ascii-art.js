class ASCIIArt {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (!this.element) return; // Exit if element doesn't exist
        
        this.isAnimating = false;
        this.animationInterval = null;
        this.render();
        this.startAnimation();
    }
    
    // Abstract method to be implemented by subclasses
    getArt(animationFrame) {
        throw new Error('getArt method must be implemented by subclass');
    }
    
    render() {
        this.element.innerHTML = this.getArt(this.isAnimating);
    }
    
    startAnimation() {
        this.animationInterval = setInterval(() => {
            this.isAnimating = !this.isAnimating;
            this.render();
        }, 1000);
    }
    
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
}