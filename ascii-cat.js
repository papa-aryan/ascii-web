class ASCIICat {
    constructor() {
        this.catElement = document.getElementById('cat');
        if (!this.catElement) return; // Exit if no cat element
        
        this.isWaving = false;
        this.render();
        this.startAnimation();
    }
    
    getCatArt(waving = false) {
        const wave = waving ? '/' : ' ';
        const rightEar = waving ? '/' : '\\';
        return `
  /\\_/\\ 
  ( o.o ) 
    > ^ < ${wave} 
 /    ${rightEar}
 (______)
 

__
  <(o )___
   ( ._> /
   \`---'
`;
    }
    
    render() {
        this.catElement.innerHTML = this.getCatArt(this.isWaving);
    }
    
    startAnimation() {
        setInterval(() => {
            this.isWaving = !this.isWaving;
            this.render();
        }, 1000);
    }
}