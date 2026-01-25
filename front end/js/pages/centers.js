/* مسار الملف: js/pages/centers.js */
// import { CONFIG } from '../data/config.js'; // تأكد من المسار الصحيح للكونفيج
import { debounce } from '../utils/helpers.js';
import { setupCustomDropdown } from '../components/ui.js';
// متغيرات عامة للصفحة
let allCenters = [];
let filters = {
    searchTerm: '',
    city: 'all'
};

export function initializeCentersPage() {
    console.log("Initializing Centers Page...");
    fetchCenters();
    setupEventListeners();
}

async function fetchCenters() {
    const container = document.getElementById('centers-grid');
    if (!container) return;
    
    container.innerHTML = '<p class="text-center text-muted">جاري تحميل المراكز...</p>';

    try {
        // جلب المراكز من الـ API العام
        const response = await fetch(`${CONFIG.getUrl(CONFIG.ENDPOINTS.PUBLIC)}/centers`);
        if (!response.ok) throw new Error("فشل في جلب البيانات");
        
        allCenters = await response.json();
        renderCenters();
        populateCityFilter();
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-center text-danger">حدث خطأ أثناء تحميل البيانات.</p>';
    }
}

function renderCenters() {
    const container = document.getElementById('centers-grid');
    const countLabel = document.getElementById('results-count');
    
    if (!container) return;

    // تطبيق الفلترة
    const filtered = allCenters.filter(center => {
        const matchesSearch = center.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesCity = filters.city === 'all' || center.city === filters.city;
        return matchesSearch && matchesCity;
    });

    // تحديث العدد
    if (countLabel) countLabel.textContent = `${filtered.length} مركز`;

    // عرض البطاقات
    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted p-5">لا توجد مراكز مطابقة للبحث</div>';
        return;
    }

    container.innerHTML = filtered.map(center => `
        <div class="center-card">
            <div class="card-header">
                <h3>${center.name}</h3>
                <span class="badge badge-secondary">${center.city}</span>
            </div>
            <div class="card-content">
                <p><i class="icon-location"></i> ${center.address || 'العنوان غير محدد'}</p>
                <p><i class="icon-phone"></i> ${center.phone}</p>
                
                <button class="btn btn-glass w-full mt-3 btn-details" data-id="${center.id}">
                    عرض التفاصيل
                </button>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const citySelect = document.getElementById('city-select'); // أو الـ Dropdown المخصص

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filters.searchTerm = e.target.value;
            renderCenters();
        }, 300));
    }
    setupCustomDropdown('city-dropdown', 'city-select', (selectedValue) => {
        console.log("تم تغيير المدينة إلى:", selectedValue);
        filters.city = selectedValue; // تحديث الفلتر
        renderCenters(); // إعادة رسم البطاقات
    });

}

function populateCityFilter() {
    // 1. استخراج المدن الفريدة (بدون تكرار)
    // filter(c => c) تزيل القيم الفارغة null أو undefined
    const cities = [...new Set(allCenters.map(c => c.city).filter(c => c))];
    
    // 2. العثور على القائمة داخل الـ Dropdown
    const dropdownMenu = document.querySelector('#city-dropdown .dropdown-menu');
    
    if (dropdownMenu) {
        // 3. بناء القائمة: نبدأ بخيار "جميع المدن" دائماً
        let menuHTML = '<div class="dropdown-item selected" data-value="all">جميع المدن</div>';
        
        // 4. إضافة كل مدينة كخيار جديد
        cities.forEach(city => {
            menuHTML += `<div class="dropdown-item" data-value="${city}">${city}</div>`;
        });

        // 5. وضع الكود داخل الصفحة
        dropdownMenu.innerHTML = menuHTML;
    }
}