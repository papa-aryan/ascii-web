/**
 * ExtrasManager - Manages the extras/side projects section
 * Follows OOP best practices for scalability and maintainability
 */
class ExtrasManager {
    constructor() {
        this.projectsContainer = document.querySelector('.projects-container');
        this.projectItems = document.querySelectorAll('.project-item');
    }

    /**
     * Add a new project to the list (for future dynamic additions)
     * @param {Object} projectData - Data for the new project
     */
    addProject(projectData) {
        const projectElement = this.createProjectElement(projectData);
        const projectList = document.querySelector('.project-list');
        projectList.appendChild(projectElement);
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