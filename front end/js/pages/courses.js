import { createCourseCard, setupCustomDropdown } from '../components/ui.js';
import { debounce } from '../utils/helpers.js';

let allCourses = []; 
let filters = {
    searchTerm: '',
    selectedLevel: 'all'
};

export function initializeCoursesPage() {
    initSearch();
    fetchCourses();
}

async function fetchCourses() {
    const container = document.getElementById('courses-grid');
    if (!container) return;
    
    container.innerHTML = '<p class="text-center text-muted">جاري تحميل الدورات...</p>';

    try {
        // استخدام CONFIG العام (الموجود في HTML)
        const baseUrl = window.CONFIG
         ? window.CONFIG.getUrl(window.CONFIG.ENDPOINTS.PUBLIC) 
         : 'http://localhost:5220/api/Public';

        const response = await fetch(`${baseUrl}/courses`);
        
        if (!response.ok) throw new Error("فشل الجلب");
        
        allCourses = await response.json();
        loadCourses(); // عرض البيانات بعد وصولها
        
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-center text-danger">حدث خطأ في الاتصال.</p>';
    }
}


function initSearch() {
    const searchInput = document.getElementById('courses-search-input');
        setupCustomDropdown('courses-level-dropdown', 'courses-level-select', (val) => {
        filters.selectedLevel = val;
        loadCourses();
    });

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filters.searchTerm = e.target.value;
            loadCourses();
        }, 300));
    }
}

function loadCourses() {
    const container = document.getElementById('courses-grid');
    if (!container) return;

    const filtered = allCourses.filter(c => {


const search = filters.searchTerm.toLowerCase();

        const matchSearch = c.name.toLowerCase().includes(search);
        const level = c.level || 'عام';
        const matchLevel = filters.selectedLevel === 'all' || level === filters.selectedLevel;
        return matchSearch && matchLevel;
    });

    if(filtered.length === 0) container.innerHTML = '<p style="text-align:center;">لا توجد دورات.</p>';
    else 
        container.innerHTML = filtered.map(c => createCourseCard(c)).join('');
}