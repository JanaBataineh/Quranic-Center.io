import { apiCenters, apiStats, currentFilters, updateFilter } from '../data/api.js';
import { createCenterCard, setupCustomDropdown } from '../components/ui.js';
import { debounce } from '../utils/helpers.js';

export function initializeCentersPage() {
  initializeSearch();
  loadCenters();
}

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const cityDropdown = document.getElementById('city-dropdown');

    // تعبئة المدن
    if (cityDropdown) {
        const menu = cityDropdown.querySelector('.dropdown-menu');
        apiStats.cities?.forEach(city => {
            menu.innerHTML += `<div class="dropdown-item" data-value="${city}">${city}</div>`;
        });
        
        setupCustomDropdown('city-dropdown', 'city-select', (val) => {
            updateFilter('selectedCity', val);
            loadCenters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            updateFilter('searchTerm', e.target.value);
            loadCenters();
        }, 300));
    }
}

function loadCenters() {
    const container = document.getElementById('centers-grid');
    const countEl = document.getElementById('results-count');
    if (!container) return;

    const filtered = apiCenters.filter(c => {
        const search = currentFilters.searchTerm.toLowerCase();
        const matchSearch = c.name.toLowerCase().includes(search);
        const matchCity = currentFilters.selectedCity === 'all' || c.city === currentFilters.selectedCity;
        return matchSearch && matchCity;
    });

    if(countEl) countEl.textContent = `${filtered.length} من ${apiCenters.length}`;
    
    if(filtered.length === 0) container.innerHTML = '<p style="text-align:center; width:100%;">لا توجد نتائج.</p>';
    else container.innerHTML = filtered.map(c => createCenterCard(c)).join('');
}