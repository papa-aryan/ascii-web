class JournalManager {
    constructor() {
        this.createModalElement();
        this.initEventListeners();
        this.loadJournalsList();
    }
    
    createModalElement() {
        // Create modal container
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'journal-modal-overlay';
        
        // Create modal content container
        this.modal = document.createElement('div');
        this.modal.className = 'journal-modal';
        
        // Create close button
        this.closeButton = document.createElement('div');
        this.closeButton.className = 'journal-modal-close';
        this.closeButton.textContent = '×';
        
        // Create content containers
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'journal-modal-content';
        
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
    
    async loadJournalsList() {
        // Only run on the journal page
        if (!window.location.pathname.includes('journal.html')) return;
        
        try {
            // Fetch all published journals
            const response = await fetch('/api/journals');
            const journals = await response.json();
            
            // Get the container to add links to
            const journalsContainer = document.querySelector('.journals-links');
            
            if (journalsContainer && journals.length > 0) {
                journalsContainer.innerHTML = ''; // Clear any existing content
                
                // Add journal links
                journals.forEach(journal => {
                    const journalLink = document.createElement('div');
                    journalLink.className = 'ascii-link';
                    journalLink.innerHTML = `<a href="#" data-journal-id="${journal.id}">${journal.title}</a>`;
                    
                    // Add click event
                    journalLink.querySelector('a').addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openJournal(journal.id);
                    });
                    
                    journalsContainer.appendChild(journalLink);
                });
            }
        } catch (error) {
            console.error('Failed to load journals:', error);
        }
    }
    
    async openJournal(id) {
        try {
            const response = await fetch(`/api/journals/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const journal = await response.json();
            
            if (journal) {
                // Set modal content
                this.modalContent.innerHTML = `
                    <h1>${journal.title}</h1>
                    <div class="post-meta">
                        <span>posted: ${new Date(journal.created_at).toISOString().split('T')[0]}</span>
                    </div>
                    <div class="post-body">
                        <p>${this.parseMarkdown(journal.content)}</p>
                    </div>
                `;
                
                // Show modal
                this.modalOverlay.classList.add('active');
                setTimeout(() => {
                    this.modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }, 10);
            }
        } catch (error) {
            console.error('Failed to load journal:', error);
        }
    }
    
    closeModal() {
        document.body.style.overflow = '';
        this.modal.classList.remove('active');
        setTimeout(() => this.modalOverlay.classList.remove('active'), 300);
    }
    
    parseMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
            .replace(/\*(.*?)\*/g, '<em>$1</em>');              // *italic*
    }
}