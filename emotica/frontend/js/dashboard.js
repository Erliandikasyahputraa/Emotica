import { isAuthenticated, getCurrentUser, API_BASE_URL, requireAuth } from './auth.js';
import { showToast, formatDate, debounce } from './utils.js';

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    requireAuth('login.html');
    initializeDashboard();
});

// Initialize dashboard components
function initializeDashboard() {
    initTextAnalysis();
    initSentimentChart();
    loadAnalysisHistory();
    loadUserStats();
    setupEventListeners();
}

// Initialize text analysis functionality
function initTextAnalysis() {
    const textInput = document.getElementById('text-to-analyze');
    const charCount = document.getElementById('char-count');
    
    if (textInput && charCount) {
        // Update character count with debounce
        const updateCharCount = debounce(() => {
            charCount.textContent = textInput.value.length;
        }, 200);
        
        textInput.addEventListener('input', updateCharCount);
        
        // Handle form submission
        const analysisForm = document.getElementById('analysis-form');
        if (analysisForm) {
            analysisForm.addEventListener('submit', handleAnalyzeText);
        }
    }
}

// Initialize sentiment chart
function initSentimentChart() {
    const ctx = document.getElementById('sentiment-chart');
    if (!ctx) return;
    
    // Chart configuration
    window.sentimentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(156, 163, 175, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${context.raw}%`
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Load user's analysis history
async function loadAnalysisHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/analyses/history?limit=5`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Failed to load analysis history');
        updateAnalysisHistoryUI(await response.json());
    } catch (error) {
        console.error('Error loading analysis history:', error);
        showToast('Failed to load analysis history', 'error');
    }
}

// Load user statistics
async function loadUserStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/analyses/stats`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Failed to load user statistics');
        updateStatsUI(await response.json());
    } catch (error) {
        console.error('Error loading user stats:', error);
        showToast('Failed to load user statistics', 'error');
    }
}

// Handle text analysis form submission
async function handleAnalyzeText(e) {
    e.preventDefault();
    
    const textInput = document.getElementById('text-to-analyze');
    const text = textInput.value.trim();
    
    if (!text) {
        showToast('Please enter some text to analyze', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/analyses/analyze`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Analysis failed');
        
        updateAnalysisResultsUI(data);
        await Promise.all([loadAnalysisHistory(), loadUserStats()]);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showToast(error.message || 'Failed to analyze text', 'error');
    }
}

// Update the UI with analysis results
function updateAnalysisResultsUI(data) {
    const elements = {
        results: document.getElementById('analysis-results'),
        sentiment: document.getElementById('sentiment-result'),
        icon: document.getElementById('sentiment-icon'),
        confidenceBar: document.getElementById('confidence-bar'),
        confidencePercent: document.getElementById('confidence-percent'),
        keywords: document.getElementById('keywords-container')
    };

    if (Object.values(elements).some(el => !el)) return;

    const { sentiment, score } = data.sentiment;
    const scorePercent = Math.round(score * 100);
    
    // Update sentiment display
    elements.results.classList.remove('hidden');
    elements.sentiment.textContent = `${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} (${scorePercent}%)`;
    
    // Update sentiment icon
    const sentimentClasses = {
        positive: { bg: 'bg-green-100', text: 'text-green-600' },
        negative: { bg: 'bg-red-100', text: 'text-red-600' },
        neutral: { bg: 'bg-yellow-100', text: 'text-yellow-600' }
    };
    
    const sentimentClass = sentimentClasses[sentiment] || sentimentClasses.neutral;
    elements.icon.className = `flex-shrink-0 h-12 w-12 rounded-full ${sentimentClass.bg} flex items-center justify-center`;
    elements.icon.innerHTML = getSentimentIcon(sentiment, sentimentClass.text);
    
    // Update confidence
    elements.confidenceBar.style.width = `${scorePercent}%`;
    elements.confidencePercent.textContent = `${scorePercent}%`;
    
    // Update keywords
    updateKeywordsUI(elements.keywords, data.keywords);
    
    // Scroll to results
    elements.results.scrollIntoView({ behavior: 'smooth' });
}

// Helper function to get sentiment icon
function getSentimentIcon(sentiment, colorClass) {
    const icons = {
        positive: `
            <svg class="h-6 w-6 ${colorClass}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `,
        negative: `
            <svg class="h-6 w-6 ${colorClass}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `,
        neutral: `
            <svg class="h-6 w-6 ${colorClass}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `
    };
    return icons[sentiment] || icons.neutral;
}

// Update keywords UI
function updateKeywordsUI(container, keywords = []) {
    container.innerHTML = keywords.length > 0
        ? keywords.map(keyword => `
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 m-1">
                ${keyword}
            </span>
        `).join('')
        : '<p class="text-sm text-gray-500">No significant keywords found.</p>';
}

// Update the analysis history UI
function updateAnalysisHistoryUI(history = []) {
    const historyList = document.getElementById('recent-analyses');
    if (!historyList) return;
    
    historyList.innerHTML = history.length > 0
        ? history.map(item => createHistoryItem(item)).join('')
        : '<li class="py-4 text-center text-gray-500">No analysis history yet. Analyze some text to get started!</li>';
}

// Create history item HTML
function createHistoryItem(item) {
    const sentimentClasses = {
        positive: 'bg-green-100 text-green-600',
        negative: 'bg-red-100 text-red-600',
        neutral: 'bg-yellow-100 text-yellow-600'
    };
    
    const sentimentClass = sentimentClasses[item.sentiment.type] || sentimentClasses.neutral;
    
    return `
        <li class="py-3 border-b border-gray-200 last:border-0">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full ${sentimentClass} flex items-center justify-center">
                        ${getSentimentIcon(item.sentiment.type, '')}
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-900 truncate max-w-xs">
                            ${item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text}
                        </p>
                        <p class="text-xs text-gray-500">
                            ${formatDate(item.createdAt)}
                        </p>
                    </div>
                </div>
                <div class="text-sm text-indigo-600 font-medium">
                    ${Math.round(item.sentiment.score * 100)}%
                </div>
            </div>
        </li>
    `;
}

// Update the stats UI
function updateStatsUI(stats = {}) {
    // Update total analyses
    const totalEl = document.getElementById('total-analyses');
    if (totalEl) totalEl.textContent = stats.totalAnalyses || 0;
    
    // Update sentiment distribution chart
    updateSentimentChart(stats.sentimentDistribution);
    
    // Update sentiment counts
    updateSentimentCounts(stats.sentimentCounts);
}

// Update sentiment chart
function updateSentimentChart(distribution = {}) {
    if (!window.sentimentChart) return;
    
    const { positive = 0, neutral = 0, negative = 0 } = distribution;
    const total = positive + neutral + negative || 1;
    
    // Update chart data
    window.sentimentChart.data.datasets[0].data = [
        Math.round((positive / total) * 100),
        Math.round((neutral / total) * 100),
        Math.round((negative / total) * 100)
    ];
    
    // Update percentage displays
    ['positive', 'neutral', 'negative'].forEach(sentiment => {
        const el = document.getElementById(`chart-${sentiment}`);
        if (el) {
            el.textContent = `${Math.round((distribution[sentiment] || 0) / total * 100)}%`;
        }
    });
    
    window.sentimentChart.update();
}

// Update sentiment counts
function updateSentimentCounts(counts = {}) {
    const elements = {
        positive: document.getElementById('positive-count'),
        negative: document.getElementById('negative-count'),
        positivePercent: document.getElementById('positive-percent'),
        negativePercent: document.getElementById('negative-percent')
    };
    
    const total = (counts.positive || 0) + (counts.negative || 0) || 1;
    
    if (elements.positive) elements.positive.textContent = counts.positive || 0;
    if (elements.negative) elements.negative.textContent = counts.negative || 0;
    
    if (elements.positivePercent) {
        elements.positivePercent.textContent = Math.round(((counts.positive || 0) / total) * 100);
    }
    if (elements.negativePercent) {
        elements.negativePercent.textContent = Math.round(((counts.negative || 0) / total) * 100);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Save analysis button
    const saveAnalysisBtn = document.getElementById('save-analysis');
    if (saveAnalysisBtn) {
        saveAnalysisBtn.addEventListener('click', handleSaveAnalysis);
    }
    
    // Debounced window resize for chart responsiveness
    const handleResize = debounce(() => {
        if (window.sentimentChart) {
            window.sentimentChart.resize();
        }
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
        window.removeEventListener('resize', handleResize);
        if (saveAnalysisBtn) {
            saveAnalysisBtn.removeEventListener('click', handleSaveAnalysis);
        }
    };
}

// Handle saving an analysis
async function handleSaveAnalysis() {
    const textInput = document.getElementById('text-to-analyze');
    const text = textInput.value.trim();
    
    if (!text) {
        showToast('No text to save', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/analyses/save`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to save analysis');
        
        showToast('Analysis saved successfully!', 'success');
        await Promise.all([loadAnalysisHistory(), loadUserStats()]);
        
    } catch (error) {
        console.error('Save analysis error:', error);
        showToast(error.message || 'Failed to save analysis', 'error');
    }
}

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Update UI based on authentication state
function updateUIForAuthState() {
    const user = getCurrentUser();
    const userInitial = document.getElementById('user-initial');
    const userName = document.getElementById('user-name');
    
    if (userInitial && user) {
        userInitial.textContent = user.name ? 
            user.name.charAt(0).toUpperCase() : 
            user.email.charAt(0).toUpperCase();
    }
    
    if (userName && user) {
        userName.textContent = user.name || user.email.split('@')[0];
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateAnalysisResultsUI,
        updateAnalysisHistoryUI,
        updateStatsUI
    };
}