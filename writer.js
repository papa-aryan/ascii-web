class BlogWriter {
    constructor() {
        this.titleInput = document.getElementById('post-title');
        this.contentTextarea = document.getElementById('post-content');
        this.previewDiv = document.getElementById('preview-content');
        this.draftsSelect = document.getElementById('drafts-select');
        this.currentDraftId = null;
        this.contentType = 'blog';
        
        // Initialize text formatters for different content types
        this.blogFormatter = TextFormatter.forBlogPosts();
        this.miniFormatter = TextFormatter.forMinis();
        
        if (!this.titleInput) return;
        
        this.initializeEventListeners();
        this.loadDraftsList();
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
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }

    switchContentType(type) {
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });
        
        this.contentType = type;
        
        // Clear form when switching types
        this.titleInput.value = '';
        this.contentTextarea.value = '';
        this.currentDraftId = null;
        this.updatePreview();
        
        // Load drafts for the selected type
        this.loadDraftsList();
    }
    
    async loadDraftsList() {
        try {
            const response = await fetch(`/api/drafts?type=${this.contentType}`);
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
        }
    }
    
    onDraftSelect() {
        const draftId = this.draftsSelect.value;
        if (!draftId) {
            // New draft
            this.currentDraftId = null;
            this.titleInput.value = '';
            this.contentTextarea.value = '';
            this.updatePreview();
        } else {
            // Load selected draft
            this.loadDraft(draftId);
        }
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
            const response = await fetch(`/api/drafts?type=${this.contentType}`);
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
            const response = await fetch('/api/drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    id: this.currentDraftId,
                    type: this.contentType
                })
            });
            
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
                const response = await fetch(`/api/drafts/${this.currentDraftId}`, {
                    method: 'DELETE'
                });
                
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
    
    async autoSave() {
        if ((this.titleInput.value.trim() || this.contentTextarea.value.trim()) && this.currentDraftId) {
            await this.saveDraft();
        }
    }
    
    // Keep existing methods: updatePreview, publishPost, showMessage, etc.
    updatePreview() {
        const title = this.titleInput.value || 'Untitled Post';
        let content = this.contentTextarea.value || 'Start writing...';
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Use the appropriate formatter based on content type
        const formatter = this.contentType === 'blog' ? this.blogFormatter : this.miniFormatter;
        const formattedContent = formatter.format(content);

        this.previewDiv.innerHTML = `
            <h1>${title}</h1>
            <div class="post-meta">
                <span>posted: ${currentDate}</span>
            </div>
            <div class="post-body">
                ${formattedContent}
            </div>
        `;
    }

    // parseMarkdown method has been replaced by TextFormatter class
    // See text-formatter.js for improved text formatting with word wrapping
    
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
            
            // For blog posts, generate HTML content
            if (this.contentType === 'blog') {
                requestData.filename = this.generateFilename(title);
                requestData.htmlContent = this.generatePostHTML(title, content);
            }
            
            const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

                        if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                this.showMessage(`${this.contentType === 'blog' ? 'Post' : 'Mini'} published successfully!`);
                if (confirm('Delete this draft?')) {
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

    
    generateFilename(title) {
        return title.toLowerCase()
                   .replace(/[^a-z0-9\s]/g, '')
                   .replace(/\s+/g, '-')
                   .substring(0, 50) + '.html';
    }
    
    generatePostHTML(title, content) {
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Use the blog formatter for generating HTML
        const formattedContent = this.blogFormatter.format(content);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <div class="duck-container">
        <div id="duck"></div>
    </div>
    
    <div class="blog-post-container">
        <div class="blog-content">
            <h1>${title}</h1>
            <div class="post-meta">
                <span>posted: ${currentDate}</span>
            </div>
            
            <div class="post-body">
                ${formattedContent}
            </div>
            
            <div class="ascii-link">
                <a href="../blog.html">← back to blog</a>
            </div>
        </div>
    </div>
    
    <script src="../text-formatter.js"></script>
    <script src="../ascii-art.js"></script>
    <script src="../ascii-duck.js"></script>
    <script src="../colors.js"></script>
    <script src="../app.js"></script>
</body>
</html>`;
    }
    
    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.2);
            color: lime;
            padding: 10px;
            border: 1px solid lime;
            font-family: 'Courier New', monospace;
            z-index: 1000;
        `;
        
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}