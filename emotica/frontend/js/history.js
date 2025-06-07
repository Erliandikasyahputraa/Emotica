import { isAuthenticated, requireAuth, getCurrentUser, API_BASE_URL } from './auth.js';
import { showToast, formatDate, debounce } from './utils.js';

// Global variables
let currentPage = 1;
const itemsPerPage = 10;
let allAnalyses = [];
let filteredAnalyses = [];

// Initialize history page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    requireAuth('login.html');
    
    // Initialize components
    initFilters();
    loadAnalyses();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI based on authentication state
    updateUIForAuthState();
});

// Initialize filter functionality
function initFilters() {
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const sentimentFilter = document.getElementById('sentiment-filter');
    const searchInput = document.getElementById('search-input');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const applyFiltersBtn = document.getElementById('apply-filters');
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    if (dateFromInput) {
        dateFromInput.valueAsDate = thirtyDaysAgo;
    }
    
    if (dateToInput) {
        dateToInput.valueAsDate = today;
    }
    
    // Apply filters when clicking apply button
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            currentPage = 1; // Reset to first page
            filterAnalyses();
        });
    }
    
    // Reset all filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (dateFromInput) dateFromInput.valueAsDate = thirtyDaysAgo;
            if (dateToInput) dateToInput.valueAsDate = today;
            if (sentimentFilter) sentimentFilter.value = 'all';
            if (searchInput) searchInput.value = '';
            
            currentPage = 1;
            filterAnalyses();
        });
    }
    
    // Debounce search input
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentPage = 1;
            filterAnalyses();
        }, 300));
    }
}

// Load analyses from the API
async function loadAnalyses() {
    try {
        showLoading(true);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/analyses/history?limit=100`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load analysis history');
        }
        
        const data = await response.json();
        allAnalyses = Array.isArray(data) ? data : [];
        
        // Initial filter and render
        filterAnalyses();
        
    } catch (error) {
        console.error('Error loading analyses:', error);
        showToast(error.message || 'Failed to load analysis history', 'error');
    } finally {
        showLoading(false);
    }
}

// Filter analyses based on current filters
function filterAnalyses() {
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const sentimentFilter = document.getElementById('sentiment-filter');
    const searchInput = document.getElementById('search-input');
    
    const dateFrom = dateFromInput ? new Date(dateFromInput.value) : null;
    const dateTo = dateToInput ? new Date(dateToInput.value) : null;
    const sentiment = sentimentFilter ? sentimentFilter.value : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    
    filteredAnalyses = allAnalyses.filter(analysis => {
        // Filter by date range
        const analysisDate = new Date(analysis.createdAt);
        if (dateFrom && analysisDate < dateFrom) return false;
        if (dateTo) {
            const endOfDay = new Date(dateTo);
            endOfDay.setHours(23, 59, 59, 999);
            if (analysisDate > endOfDay) return false;
        }
        
        // Filter by sentiment
        if (sentiment !== 'all' && analysis.sentiment.type !== sentiment) {
            return false;
        }
        
        // Filter by search query
        if (searchQuery && !analysis.text.toLowerCase().includes(searchQuery)) {
            return false;
        }
        
        return true;
    });
    
    // Sort by date (newest first)
    filteredAnalyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Update pagination and render
    updatePagination();
    renderAnalyses();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
    const paginationInfo = document.getElementById('pagination-info');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    
    // Update pagination info
    if (paginationInfo) {
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, filteredAnalyses.length);
        paginationInfo.textContent = `Showing ${startItem} to ${endItem} of ${filteredAnalyses.length} results`;
    }
    
    // Update page indicator
    if (pageIndicator) {
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }
    
    // Update button states
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
}

// Render analyses in the table
function renderAnalyses() {
    const tbody = document.querySelector('#analyses-table tbody');
    const emptyState = document.getElementById('empty-state');
    
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Show empty state if no analyses
    if (filteredAnalyses.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    } else if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredAnalyses.length);
    const paginatedAnalyses = filteredAnalyses.slice(startIndex, endIndex);
    
    // Create table rows
    paginatedAnalyses.forEach(analysis => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                    ${analysis.text.length > 100 ? analysis.text.substring(0, 100) + '...' : analysis.text}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    analysis.sentiment.type === 'positive' ? 'bg-green-100 text-green-800' :
                    analysis.sentiment.type === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }">
                    ${analysis.sentiment.type.charAt(0).toUpperCase() + analysis.sentiment.type.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(analysis.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="analysis-detail.html?id=${analysis._id}" class="text-indigo-600 hover:text-indigo-900">View</a>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Pagination buttons
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderAnalyses();
                updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderAnalyses();
                updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAnalyses);
    }
    
    // Delete selected button
    const deleteSelectedBtn = document.getElementById('delete-selected');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedAnalyses);
    }
}

// Show/hide loading state
function showLoading(isLoading) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const content = document.getElementById('content');
    
    if (loadingSpinner) {
        loadingSpinner.style.display = isLoading ? 'flex' : 'none';
    }
    
    if (content) {
        content.style.display = isLoading ? 'none' : 'block';
    }
}

// Export analyses to CSV
function exportAnalyses() {
    if (filteredAnalyses.length === 0) {
        showToast('No analyses to export', 'warning');
        return;
    }
    
    try {
        // Create CSV header
        let csvContent = 'Date,Text,Sentiment,Score\n';
        
        // Add analysis data
        filteredAnalyses.forEach(analysis => {
            const date = new Date(analysis.createdAt).toISOString().split('T')[0];
            const text = `"${analysis.text.replace(/"/g, '""')}"`; // Escape quotes in text
            const sentiment = analysis.sentiment.type;
            const score = analysis.sentiment.score;
            
            csvContent += `${date},${text},${sentiment},${score}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Set the download filename with current date
        const today = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `emotica-analyses-${today}.csv`);
        link.style.visibility = 'hidden';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Export completed successfully!', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('Failed to export analyses', 'error');
    }
}

// Delete selected analyses
async function deleteSelectedAnalyses() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkboxes)
        .map(checkbox => checkbox.value)
        .filter(id => id);
    
    if (selectedIds.length === 0) {
        showToast('Please select analyses to delete', 'warning');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected analyses? This action cannot be undone.`)) {
        return;
    }
    
    try {
        showLoading(true);
        const token = localStorage.getItem('token');
        
        // Delete each selected analysis
        const deletePromises = selectedIds.map(id => 
            fetch(`${API_BASE_URL}/analyses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
        );
        
        // Wait for all delete operations to complete
        await Promise.all(deletePromises);
        
        // Reload analyses
        await loadAnalyses();
        
        showToast(`Successfully deleted ${selectedIds.length} analyses`, 'success');
        
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete selected analyses', 'error');
    } finally {
        showLoading(false);
    }
}

// Update UI based on authentication state
function updateUIForAuthState() {
    const user = getCurrentUser();
    const userInitial = document.getElementById('user-initial');
    
    if (userInitial && user) {
        userInitial.textContent = user.name ? 
            user.name.charAt(0).toUpperCase() : 
            user.email.charAt(0).toUpperCase();
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        filterAnalyses,
        updatePagination,
        renderAnalyses,
        exportAnalyses
    };
}
