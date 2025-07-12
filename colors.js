class RandomColors {
    constructor() {
        this.initRandomColors();
    }
    
    getRandomColor() {
        const colors = [
            'cyan', 'lime', 'hotpink',
            'lavender', 'lightblue', 'lightcoral', 
            'lightgreen', 'lightyellow', 'lightpink',
            'peachpuff', 'paleturquoise', 'plum',
            'skyblue', 'springgreen', 'violet',
            'aqua', 'fuchsia', 'gold'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    initRandomColors() {
        document.querySelectorAll('.ascii-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.color = this.getRandomColor();
            });
            link.addEventListener('mouseleave', () => {
                link.style.color = '';
            });
        });
    }
}