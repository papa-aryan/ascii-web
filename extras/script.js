/**
 * ExtrasManager - Manages the extras/side projects section
 * Follows OOP best practices for scalability and maintainability
 */
class ExtrasManager {
    constructor() {
        this.projectsContainer = document.querySelector('.projects-container');
        this.projectItems = document.querySelectorAll('.project-item');
        
        this.initializeEventListeners();
        this.initializeAnimations();
    }
    
    /**
     * Initialize event listeners for project interactions
     */
    initializeEventListeners() {
        this.projectItems.forEach(item => {
            const link = item.querySelector('.project-link');
            if (link) {
                link.addEventListener('mouseenter', () => this.onProjectHover(item));
                link.addEventListener('mouseleave', () => this.onProjectLeave(item));
                link.addEventListener('click', (e) => this.onProjectClick(e, link));
            }
        });
    }
    
    /**
     * Initialize any entrance animations or visual effects
     */
    initializeAnimations() {
        // Add staggered fade-in animation for project items
        this.projectItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100 + 200); // Staggered timing
        });
    }
    
    /**
     * Handle project hover effects
     * @param {HTMLElement} item - The project item being hovered
     */
    onProjectHover(item) {
        // Could add additional hover effects here
        item.style.transform = 'translateX(10px)';
    }
    
    /**
     * Handle project hover leave effects
     * @param {HTMLElement} item - The project item being left
     */
    onProjectLeave(item) {
        item.style.transform = 'translateX(0)';
    }
    
    /**
     * Handle project click events
     * @param {Event} event - The click event
     * @param {HTMLElement} link - The link element being clicked
     */
    onProjectClick(event, link) {
        // Could add click analytics, loading states, or other functionality here
        // For now, just let the default navigation happen
        
        // Optional: Add a subtle click effect
        const item = link.closest('.project-item');
        item.style.transform = 'scale(0.98)';
        setTimeout(() => {
            item.style.transform = '';
        }, 150);
    }
    
    /**
     * Add a new project to the list (for future dynamic additions)
     * @param {Object} projectData - Data for the new project
     */
    addProject(projectData) {
        const projectElement = this.createProjectElement(projectData);
        const projectList = document.querySelector('.project-list');
        projectList.appendChild(projectElement);
        
        // Reinitialize event listeners for the new element
        this.initializeEventListeners();
    }
    
    /**
     * Create a project element from data
     * @param {Object} projectData - Data for creating the project element
     * @returns {HTMLElement} The created project element
     */
    createProjectElement(projectData) {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        
        projectItem.innerHTML = `
            <a href="${projectData.url}" class="project-link">
                <h3>${projectData.title}</h3>
                <p class="project-description">${projectData.description}</p>
            </a>
        `;
        
        return projectItem;
    }
}

// Initialize the ExtrasManager when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExtrasManager();
}); 