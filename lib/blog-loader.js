class BlogLoader {
    constructor() {
        this.isLoaded = false;
    }

    /**
     * Initialize blog posts loading if on blog page
     */
    async init() {
        // Only run on the blog page
        if (!window.location.pathname.includes('blog.html')) return;
        
        await this.loadBlogPostsList();
    }

    /**
     * Load and display blog posts from API
     */
    async loadBlogPostsList() {
        try {
            // Fetch all published blog posts
            const response = await fetch('/api/blog-posts');
            const blogPosts = await response.json();
            
            // Get the container to add links to
            const blogPostsContainer = document.querySelector('.blog-posts');
            
            if (blogPostsContainer) {
                // Clear existing content
                blogPostsContainer.innerHTML = '';
                
                if (blogPosts.length === 0) {
                    blogPostsContainer.innerHTML = '<p>No blog posts yet.</p>';
                    return;
                }
                
                // Add blog post links
                blogPosts.forEach(post => {
                    const postLink = document.createElement('div');
                    postLink.className = 'ascii-link';
                    postLink.innerHTML = `<a href="blogposts/${post.filename}">${post.title}</a>`;
                    blogPostsContainer.appendChild(postLink);
                });
                
                this.isLoaded = true;
            }
        } catch (error) {
            console.error('Failed to load blog posts:', error);
            
            // Fallback: show error message
            const blogPostsContainer = document.querySelector('.blog-posts');
            if (blogPostsContainer) {
                blogPostsContainer.innerHTML = '<p>Error loading blog posts.</p>';
            }
        }
    }

    /**
     * Refresh blog posts list (useful after publishing)
     */
    async refresh() {
        if (this.isLoaded) {
            await this.loadBlogPostsList();
        }
    }
}

// Make it available globally
window.BlogLoader = BlogLoader; 