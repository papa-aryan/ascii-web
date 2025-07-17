class BlogWriter {
    constructor() {
        this.titleInput = document.getElementById('post-title');
        this.contentTextarea = document.getElementById('post-content');
        this.previewDiv = document.getElementById('preview-content');
        this.draftsSelect = document.getElementById('drafts-select');
        this.backLinkContainer = document.getElementById('back-link-container');
        this.currentDraftId = null;
        this.contentType = 'blog';
        
        // Initialize AuthManager
        this.authManager = new AuthManager();
        
        if (!this.titleInput) return;
        
        // Verify authentication before proceeding
        if (!this.authManager.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }
        
        // Initialize with correct content type from URL
        this.initializeFromURL();
        this.initializeEventListeners();
        this.updateBackLink();
        this.loadDraftsList();
    }
    
    /**
     * Parse URL parameters and initialize the writer with the correct content type
     */
    initializeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const typeFromURL = urlParams.get('type');
        
        if (typeFromURL && (typeFromURL === 'blog' || typeFromURL === 'journal')) {
            this.contentType = typeFromURL;
            this.setActiveTab(typeFromURL);
        }
    }
    
    /**
     * Set the active tab based on content type
     */
    setActiveTab(type) {
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.type === type) {
                tab.classList.add('active');
            }
        });
    }
    
    /**
     * Switch content type and reload drafts
     */
    switchContentType(type) {
        this.contentType = type;
        this.setActiveTab(type);
        this.updateBackLink();
        this.loadDraftsList();
        this.clearForm();
    }
    
    initializeEventListeners() {
        // Add tab selection handling
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.addEventListener('click', () => this.switchContentType(tab.dataset.type));
        });
        
        // Real-time preview
        this.contentTextarea.addEventListener('input', () => this.updatePreview());
        this.titleInput.addEventListener('input', () => this.updatePreview());
        
        // Draft selection
        if (this.draftsSelect) {
            this.draftsSelect.addEventListener('change', () => this.onDraftSelect());
        }
        
        // Buttons
        document.getElementById('save-draft').addEventListener('click', () => this.saveDraft());
        document.getElementById('delete-draft').addEventListener('click', () => this.deleteDraft());
        document.getElementById('publish-post').addEventListener('click', () => this.publishPost());
        
        // Logout button
        document.getElementById('logout-button').addEventListener('click', () => this.logout());
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }
    
    /**
     * Handle logout
     */
    async logout() {
        try {
            await this.authManager.logout();
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            window.location.href = '/index.html';
        }
    }
    
    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        console.error('Authentication error:', error);
        this.showMessage('Session expired. Please log in again.');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }
    
    async loadDraftsList() {
        try {
            const response = await this.authManager.authenticatedFetch(`/api/drafts?type=${this.contentType}`);
            
            if (response.status === 401) {
                this.handleAuthError('Unauthorized');
                return;
            }
            
            const drafts = await response.json();
            
            // Clear and populate dropdown
            this.draftsSelect.innerHTML = '<option value="">New Draft</option>';
            drafts.forEach(draft => {
                const option = document.createElement('option');
                option.value = draft.id;
                option.textContent = draft.title || `Draft ${draft.id}`;
                this.draftsSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load drafts:', error);
            this.showMessage('Failed to load drafts');
        }
    }
    
    onDraftSelect() {
        const draftId = this.draftsSelect.value;
        if (draftId) {
            this.loadDraft(draftId);
        } else {
            this.clearForm();
        }
    }
    
    clearForm() {
        this.currentDraftId = null;
        this.titleInput.value = '';
        this.contentTextarea.value = '';
        this.updatePreview();
        this.draftsSelect.value = '';
    }
    
    async loadDraft(draftId) {
        // For now, we'll get the draft from the dropdown data
        // In a full implementation, you'd fetch from server
        const drafts = await this.getDraftsFromServer();
        const draft = drafts.find(d => d.id == draftId);
        
        if (draft) {
            this.currentDraftId = draft.id;
            this.titleInput.value = draft.title;
            this.contentTextarea.value = draft.content;
            this.updatePreview();
        }
    }
    
    async getDraftsFromServer() {
        try {
            const response = await this.authManager.authenticatedFetch(`/api/drafts?type=${this.contentType}`);
            
            if (response.status === 401) {
                this.handleAuthError('Unauthorized');
                return [];
            }
            
            return await response.json();
        } catch (error) {
            console.error('Failed to get drafts:', error);
            return [];
        }
    }
    
    async saveDraft() {
        const title = this.titleInput.value.trim();
        const content = this.contentTextarea.value.trim();
        
        if (!title && !content) return;
        
        try {
            const response = await this.authManager.authenticatedFetch('/api/drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    id: this.currentDraftId,
                    type: this.contentType
                })
            });
            
            if (response.status === 401) {
                this.handleAuthError('Unauthorized');
                return;
            }
            
            const result = await response.json();
            if (result.success) {
                this.currentDraftId = result.id;
                this.showMessage('Draft saved!');
                this.loadDraftsList(); // Refresh the dropdown
            }
        } catch (error) {
            this.showMessage('Failed to save draft');
        }
    }
    
    async deleteDraft() {
        if (!this.currentDraftId) return;
        
        if (confirm('Delete this draft?')) {
            try {
                const response = await this.authManager.authenticatedFetch(`/api/drafts/${this.currentDraftId}`, {
                    method: 'DELETE'
                });
                
                if (response.status === 401) {
                    this.handleAuthError('Unauthorized');
                    return;
                }
                
                const result = await response.json();
                if (result.success) {
                    this.currentDraftId = null;
                    this.titleInput.value = '';
                    this.contentTextarea.value = '';
                    this.draftsSelect.value = '';
                    this.updatePreview();
                    this.loadDraftsList();
                    this.showMessage('Draft deleted');
                }
            } catch (error) {
                this.showMessage('Failed to delete draft');
            }
        }
    }
    
    autoSave() {
        const title = this.titleInput.value.trim();
        const content = this.contentTextarea.value.trim();
        
        if ((title || content) && this.hasUnsavedChanges()) {
            this.saveDraft();
        }
    }
    
    hasUnsavedChanges() {
        // Simple check - in a real app you'd compare with last saved state
        return true;
    }
    
    async publishPost() {
        const title = this.titleInput.value.trim();
        const content = this.contentTextarea.value.trim();
        
        if (!title || !content) {
            this.showMessage('Please add both title and content!');
            return;
        }
        
        try {
            // Prepare request data based on content type
            const requestData = {
                title,
                content,
                type: this.contentType
            };
            
            const response = await this.authManager.authenticatedFetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            if (response.status === 401) {
                this.handleAuthError('Unauthorized');
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                this.showMessage(`${this.contentType === 'blog' ? 'Post' : 'Journal'} published successfully!`);
                if (this.currentDraftId && confirm('Delete this draft?')) {
                    this.deleteDraft();
                }
            } else {
                this.showMessage(`Publish failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Publish error:', error);
            this.showMessage('Failed to publish');
        }
    }
    
    updatePreview() {
        const title = this.titleInput.value;
        const content = this.contentTextarea.value;
        
        const formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        
        this.previewDiv.innerHTML = title ? 
            `<h2>${title}</h2><p>${formattedContent}</p>` : 
            formattedContent;
    }
    
    updateBackLink() {
        if (this.backLinkContainer) {
            const linkText = this.contentType === 'blog' ? '← back to blog' : '← back to journal';
            const linkHref = this.contentType === 'blog' ? 'blog.html' : 'journal.html';
            this.backLinkContainer.innerHTML = `<a href="${linkHref}">${linkText}</a>`;
        }
    }
    
    showMessage(message) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: rgba(0, 255, 0, 0.1); 
            border: 1px solid lime; 
            color: lime; 
            padding: 10px 20px; 
            font-family: 'Courier New', monospace; 
            z-index: 9999;
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }
}