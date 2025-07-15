class ASCIICat extends ASCIIArt {
    constructor() {
        super('cat'); // Pass the element ID to the parent constructor
    }
    
    getArt(waving = false) {
        const wave = waving ? '/' : ' ';
        const rightEar = waving ? '/' : '\\';
        const hiText = waving ? 'hi' : '  ';
        return `
  /\\_/\\ 
    ( o.o ) ${hiText}
    > ^ < ${wave} 
 /    ${rightEar}
 (______)`;
    }
}