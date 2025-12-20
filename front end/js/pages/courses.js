import { apiCourses, apiStats, currentFilters, updateFilter } from '../data/api.js';
import { createCourseCard, setupCustomDropdown } from '../components/ui.js';
import { debounce } from '../utils/helpers.js';

export function initializeCoursesPage() {
    initSearch();
    loadCourses();
}

function initSearch() {
    const searchInput = document.getElementById('courses-search-input');
    
    // إعداد القوائم (المدينة، المستوى، الترتيب)
    // ... (نفس منطق setupCustomDropdown لباقي الفلاتر) ...
    setupCustomDropdown('courses-level-dropdown', 'courses-level-select', (val) => {
        updateFilter('selectedLevel', val);
        loadCourses();
    });

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            updateFilter('searchTerm', e.target.value);
            loadCourses();
        }, 300));
    }
}

function loadCourses() {
    const container = document.getElementById('courses-grid');
    if (!container) return;

    const filtered = apiCourses.filter(c => {
        const search = currentFilters.searchTerm.toLowerCase();
        const matchSearch = c.name.toLowerCase().includes(search);
        const matchLevel = currentFilters.selectedLevel === 'all' || c.level === currentFilters.selectedLevel;
        return matchSearch && matchLevel;
    });

    if(filtered.length === 0) container.innerHTML = '<p style="text-align:center;">لا توجد دورات.</p>';
    else container.innerHTML = filtered.map(c => createCourseCard(c)).join('');
}