// Main application entry point
import { isAuthenticated, requireAuth, redirectIfAuthenticated, getCurrentUser } from './auth.js';
import { showToast, getInitials } from './utils.js';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupGlobalEventListeners();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Check authentication state and update UI
    updateAuthUI();
    
    // Initialize active link in navigation
    setActiveNavLink();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize mobile menu toggle
    initializeMobileMenu();
}

/**
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        // Close user dropdown
        const profileMenu = document.getElementById('profile-menu');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (profileMenu && dropdownMenu && !profileMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
        
        // Close mobile menu when clicking outside
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        
        if (mobileMenu && mobileMenuButton && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuButton.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
    
    // Handle escape key to close modals and dropdowns
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close all dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.add('hidden');
            });
            
            // Close mobile menu
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
}

/**
 * Update UI based on authentication state
 */
function updateAuthUI() {
    const isLoggedIn = isAuthenticated();
    const user = getCurrentUser();
    
    // Update auth links
    document.querySelectorAll('.auth-link').forEach(link => {
        link.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    // Update protected links
    document.querySelectorAll('.protected-link').forEach(link => {
        link.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    // Update profile menu
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.style.display = isLoggedIn ? 'block' : 'none';
        
        // Update user initial/avatar
        const userInitial = profileMenu.querySelector('#user-initial');
        if (userInitial && user) {
            userInitial.textContent = getInitials(user.name || user.email);
        }
    }
    
    // Update user greeting
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting && user) {
        userGreeting.textContent = `Hi, ${user.name || 'there'}!`;
    }
}

/**
 * Set active link in navigation based on current page
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || 
            (currentPath === '' && href === 'index.html') ||
            (currentPath === 'dashboard.html' && href === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    // This would be implemented with a tooltip library or custom implementation
    // For now, we'll just add event listeners for tooltip triggers
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    
    tooltipTriggers.forEach(trigger => {
        const tooltipId = trigger.getAttribute('aria-describedby');
        const tooltip = tooltipId ? document.getElementById(tooltipId) : null;
        
        if (tooltip) {
            trigger.addEventListener('mouseenter', () => {
                tooltip.classList.remove('invisible', 'opacity-0');
                tooltip.classList.add('visible', 'opacity-100');
            });
            
            trigger.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible', 'opacity-100');
                tooltip.classList.add('invisible', 'opacity-0');
            });
        }
    });
}

/**
 * Initialize mobile menu toggle
 */
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            
            // Toggle aria-expanded
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle icon between menu and X
            const menuIcon = mobileMenuButton.querySelector('svg:first-child');
            const closeIcon = mobileMenuButton.querySelector('svg:last-child');
            
            if (isExpanded) {
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            } else {
                menuIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            }
        });
    }
}

/**
 * Show a loading spinner
 * @param {boolean} show - Whether to show or hide the spinner
 * @param {string} message - Optional message to display with the spinner
 */
function showLoading(show, message = 'Loading...') {
    let spinner = document.getElementById('loading-spinner');
    
    if (!spinner && show) {
        // Create spinner if it doesn't exist
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        spinner.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p class="text-gray-700">${message}</p>
            </div>
        `;
        document.body.appendChild(spinner);
    } else if (spinner && !show) {
        // Remove spinner
        document.body.removeChild(spinner);
    } else if (spinner && show && message) {
        // Update message if spinner exists and new message is provided
        const messageEl = spinner.querySelector('p');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }
}

/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Export functions for use in other modules
export {
    showLoading,
    formatDate,
    updateAuthUI
};

// Initialize any page-specific functionality
function initPage() {
    const page = document.body.getAttribute('data-page');
    
    switch (page) {
        case 'dashboard':
            // Initialize dashboard-specific functionality
            if (typeof initDashboard === 'function') {
                initDashboard();
            }
            break;
            
        case 'history':
            // Initialize history page functionality
            if (typeof initHistoryPage === 'function') {
                initHistoryPage();
            }
            break;
            
        case 'login':
        case 'register':
            // Redirect to dashboard if already logged in
            if (isAuthenticated()) {
                window.location.href = 'dashboard.html';
            }
            break;
            
        default:
            // No specific initialization needed
            break;
    }
}

// Run page initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);
