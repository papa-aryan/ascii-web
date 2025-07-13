class MinisManager {
    constructor() {
        this.createModalElement();
        this.initEventListeners();
        this.loadMinisList();
    }
    
    createModalElement() {
        // Create modal container
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'mini-modal-overlay';
        
        // Create modal content container
        this.modal = document.createElement('div');
        this.modal.className = 'mini-modal';
        
        // Create close button
        this.closeButton = document.createElement('div');
        this.closeButton.className = 'mini-modal-close';
        this.closeButton.textContent = '×';
        
        // Create content containers
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'mini-modal-content';
        
        // Assemble modal
        this.modal.appendChild(this.closeButton);
        this.modal.appendChild(this.modalContent);
        
        this.modalOverlay.appendChild(this.modal);
        
        // Add to document
        document.body.appendChild(this.modalOverlay);
    }
    
    initEventListeners() {
        // Close button listener
        this.closeButton.addEventListener('click', () => this.closeModal());
        
        // Close on overlay click
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalOverlay.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    async loadMinisList() {
        // Only run on the minis page
        if (!window.location.pathname.includes('minis.html')) return;
        
        try {
            // Fetch all published minis
            const response = await fetch('/api/minis');
            const minis = await response.json();
            
            // Get the container to add links to
            const minisContainer = document.querySelector('.minis-links');
            
            if (minisContainer && minis.length > 0) {
                minisContainer.innerHTML = ''; // Clear any existing content
                
                // Add mini links
                minis.forEach(mini => {
                    const miniLink = document.createElement('div');
                    miniLink.className = 'ascii-link';
                    miniLink.innerHTML = `<a href="#" data-mini-id="${mini.id}">${mini.title}</a>`;
                    
                    // Add click event
                    miniLink.querySelector('a').addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openMini(mini.id);
                    });
                    
                    minisContainer.appendChild(miniLink);
                });
            }
        } catch (error) {
            console.error('Failed to load minis:', error);
        }
    }
    
    async openMini(id) {
        try {
            const response = await fetch(`/api/minis/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const mini = await response.json();
            
            if (mini) {
                // Set modal content
                this.modalContent.innerHTML = `
                    <h1>${mini.title}</h1>
                    <div class="post-meta">
                        <span>posted: ${new Date(mini.created_at).toISOString().split('T')[0]}</span>
                    </div>
                    <div class="post-body">
                        <p>${this.parseMarkdown(mini.content)}</p>
                    </div>
                `;
                
                // Show modal
                this.modalOverlay.classList.add('active');
                setTimeout(() => this.modal.classList.add('active'), 10);
            }
        } catch (error) {
            console.error('Failed to load mini:', error);
        }
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        setTimeout(() => this.modalOverlay.classList.remove('active'), 300);
    }
    
    parseMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic*
            .replace(/\n/g, '<br>');                           // line breaks
    }
}