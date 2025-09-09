// متغيرات عامة
let currentFilters = {
  searchTerm: '',
  selectedCity: 'all',
  selectedLevel: 'all',
  sortBy: 'name'
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializePage();
});

// تهيئة التنقل
function initializeNavigation() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }
  
  // إغلاق القائمة عند النقر خارجها
  document.addEventListener('click', function(e) {
    if (!mobileMenuBtn?.contains(e.target) && !navMenu?.contains(e.target)) {
      navMenu?.classList.remove('active');
    }
  });
}

// تهيئة الصفحة حسب النوع
function initializePage() {
  const page = document.body.getAttribute('data-page');
  
  switch(page) {
    case 'home':
      initializeHomePage();
      break;
    case 'centers':
      initializeCentersPage();
      break;
    case 'courses':
      initializeCoursesPage();
      break;
    case 'contact':
      initializeContactPage();
      break;
  }
}

// تهيئة الصفحة الرئيسية
function initializeHomePage() {
  loadStatistics();
  loadFeaturedCenters();
  loadRecentCourses();
}

// تحميل الإحصائيات
function loadStatistics() {
  const stats = getStatistics();
  const statElements = document.querySelectorAll('[data-stat]');
  
  statElements.forEach(element => {
    const statType = element.getAttribute('data-stat');
    switch(statType) {
      case 'centers':
        element.textContent = stats.totalCenters;
        break;
      case 'courses':
        element.textContent = stats.totalCourses;
        break;
      case 'cities':
        element.textContent = stats.totalCities;
        break;
      case 'rating':
        element.textContent = stats.averageRating;
        break;
    }
  });
}

// تحميل المراكز المميزة
function loadFeaturedCenters() {
  const container = document.getElementById('featured-centers');
  if (!container) return;
  
  const featuredCenters = quranicCenters
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
  
  container.innerHTML = featuredCenters.map(center => createCenterCard(center)).join('');
}

// تحميل الدورات الحديثة
function loadRecentCourses() {
  const container = document.getElementById('recent-courses');
  if (!container) return;
  
  const recentCourses = getAllCourses().slice(0, 4);
  
  container.innerHTML = recentCourses.map(course => `
    <div class="card">
      <div class="card-content">
        <div class="flex justify-between items-start mb-3">
          <h4>${course.name}</h4>
          <span class="badge badge-${getLevelClass(course.level)}">${course.level}</span>
        </div>
        <p class="text-muted mb-4">${course.description}</p>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <svg class="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>${course.centerName} - ${course.centerCity}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>${course.duration}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// تهيئة صفحة المراكز
function initializeCentersPage() {
  loadStatistics();
  initializeSearch();
  loadCenters();
}

// تهيئة صفحة الدورات
function initializeCoursesPage() {
  loadCoursesStatistics();
  initializeCoursesSearch();
  loadCourses();
}

// تحميل إحصائيات الدورات
function loadCoursesStatistics() {
  const allCourses = getAllCourses();
  const stats = {
    totalCourses: allCourses.length,
    averagePrice: Math.round(allCourses.reduce((sum, course) => sum + course.price, 0) / allCourses.length),
    beginnerCourses: allCourses.filter(c => c.level === 'مبتدئ').length,
    advancedCourses: allCourses.filter(c => c.level === 'متقدم').length
  };
  
  const statElements = document.querySelectorAll('[data-course-stat]');
  statElements.forEach(element => {
    const statType = element.getAttribute('data-course-stat');
    switch(statType) {
      case 'total':
        element.textContent = stats.totalCourses;
        break;
      case 'price':
        element.textContent = stats.averagePrice;
        break;
      case 'beginner':
        element.textContent = stats.beginnerCourses;
        break;
      case 'advanced':
        element.textContent = stats.advancedCourses;
        break;
    }
  });
}

// تهيئة البحث والتصفية
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  const citySelect = document.getElementById('city-select');
  const levelSelect = document.getElementById('level-select');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  // تحميل المدن في القائمة المنسدلة
  if (citySelect) {
    const cities = getStatistics().cities;
    citySelect.innerHTML = '<option value="all">جميع المدن</option>' +
      cities.map(city => `<option value="${city}">${city}</option>`).join('');
  }
  
  // ربط الأحداث
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      currentFilters.searchTerm = searchInput.value;
      loadCenters();
    }, 300));
  }
  
  if (citySelect) {
    citySelect.addEventListener('change', () => {
      currentFilters.selectedCity = citySelect.value;
      loadCenters();
    });
  }
  
  if (levelSelect) {
    levelSelect.addEventListener('change', () => {
      currentFilters.selectedLevel = levelSelect.value;
      loadCenters();
    });
  }
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }
}

// تهيئة البحث للدورات
function initializeCoursesSearch() {
  const searchInput = document.getElementById('courses-search-input');
  const citySelect = document.getElementById('courses-city-select');
  const levelSelect = document.getElementById('courses-level-select');
  const sortSelect = document.getElementById('courses-sort-select');
  const clearFiltersBtn = document.getElementById('courses-clear-filters');
  
  // تحميل المدن في القائمة المنسدلة
  if (citySelect) {
    const cities = getStatistics().cities;
    citySelect.innerHTML = '<option value="all">جميع المدن</option>' +
      cities.map(city => `<option value="${city}">${city}</option>`).join('');
  }
  
  // ربط الأحداث
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      currentFilters.searchTerm = searchInput.value;
      loadCourses();
    }, 300));
  }
  
  if (citySelect) {
    citySelect.addEventListener('change', () => {
      currentFilters.selectedCity = citySelect.value;
      loadCourses();
    });
  }
  
  if (levelSelect) {
    levelSelect.addEventListener('change', () => {
      currentFilters.selectedLevel = levelSelect.value;
      loadCourses();
    });
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sortBy = sortSelect.value;
      loadCourses();
    });
  }
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearCoursesFilters);
  }
}

// تحميل المراكز مع التصفية
function loadCenters() {
  const container = document.getElementById('centers-grid');
  const resultsCount = document.getElementById('results-count');
  
  if (!container) return;
  
  const filteredCenters = filterCenters(quranicCenters);
  
  if (resultsCount) {
    resultsCount.textContent = `${filteredCenters.length} من ${quranicCenters.length}`;
  }
  
  if (filteredCenters.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12" style="grid-column: 1/-1;">
        <div class="mb-4">
          <svg class="icon" style="width: 4rem; height: 4rem; margin: 0 auto; color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3>لا توجد مراكز</h3>
        <p class="text-muted mb-4">لم نتمكن من العثور على مراكز تطابق البحث أو الفلاتر المحددة</p>
        <button class="btn btn-primary" onclick="clearFilters()">مسح جميع الفلاتر</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredCenters.map(center => createCenterCard(center)).join('');
}

// تحميل الدورات مع التصفية
function loadCourses() {
  const container = document.getElementById('courses-grid');
  const resultsCount = document.getElementById('courses-results-count');
  
  if (!container) return;
  
  const filteredCourses = filterCourses(getAllCourses());
  
  if (resultsCount) {
    resultsCount.textContent = `${filteredCourses.length} من ${getAllCourses().length}`;
  }
  
  if (filteredCourses.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12" style="grid-column: 1/-1;">
        <div class="mb-4">
          <svg class="icon" style="width: 4rem; height: 4rem; margin: 0 auto; color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
        </div>
        <h3>لا توجد دورات</h3>
        <p class="text-muted mb-4">لم نتمكن من العثور على دورات تطابق البحث أو الفلاتر المحددة</p>
        <button class="btn btn-primary" onclick="clearCoursesFilters()">مسح جميع الفلاتر</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredCourses.map(course => createCourseCard(course)).join('');
}

// تصفية المراكز
function filterCenters(centers) {
  return centers.filter(center => {
    const matchesSearch = currentFilters.searchTerm === '' || 
      center.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
      center.description.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
      center.courses.some(course => 
        course.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(currentFilters.searchTerm.toLowerCase())
      );

    const matchesCity = currentFilters.selectedCity === 'all' || center.city === currentFilters.selectedCity;
    
    const matchesLevel = currentFilters.selectedLevel === 'all' || 
      center.courses.some(course => course.level === currentFilters.selectedLevel);

    return matchesSearch && matchesCity && matchesLevel;
  });
}

// تصفية الدورات
function filterCourses(courses) {
  let filtered = courses.filter(course => {
    const matchesSearch = currentFilters.searchTerm === '' || 
      course.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) ||
      course.centerName.toLowerCase().includes(currentFilters.searchTerm.toLowerCase());

    const matchesCity = currentFilters.selectedCity === 'all' || course.centerCity === currentFilters.selectedCity;
    const matchesLevel = currentFilters.selectedLevel === 'all' || course.level === currentFilters.selectedLevel;

    return matchesSearch && matchesCity && matchesLevel;
  });

  // ترتيب النتائج
  switch (currentFilters.sortBy) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.centerRating - a.centerRating);
      break;
    case 'name':
    default:
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      break;
  }

  return filtered;
}

// إنشاء بطاقة مركز
function createCenterCard(center) {
  return `
    <div class="card">
      <div style="position: relative;">
        <img src="${center.image}" alt="${center.name}" class="card-image">
       <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-radius: 9999px; padding: 0.25rem 0.75rem; display: flex; align-items: center; gap: 0.25rem;">
        </div>
      </div>
      
      <div class="card-header" style="padding-bottom: 0.75rem;">
        <div class="flex justify-between items-start gap-3 mb-2">
          <h3 style="margin: 0; line-height: 1.4;">${center.name}</h3>
          <span class="badge badge-secondary" style="flex-shrink: 0;">${center.courses.length} دورة</span>
        </div>
        <p style="color: var(--muted); margin: 0; line-height: 1.4;">${center.description}</p>
      </div>
      
      <div class="card-content" style="padding-top: 0;">
        <div class="flex items-center gap-2 text-sm mb-3" style="color: var(--muted);">
          <svg class="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>${center.address}, ${center.city}</span>
        </div>
        
        <div class="flex items-center gap-2 text-sm mb-3" style="color: var(--muted);">
          <svg class="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          <span>${center.phone}</span>
        </div>
        
        <div class="flex items-center gap-2 text-sm mb-4" style="color: var(--muted);">
          <svg class="icon icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0v8a2 2 0 002 2h4a2 2 0 002-2V7"/>
          </svg>
          <span>تأسس عام ${center.established}</span>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-4">
          ${center.courses.slice(0, 2).map(course => 
            `<span class="badge badge-secondary" style="font-size: 0.75rem;">${course.name}</span>`
          ).join('')}
          ${center.courses.length > 2 ? 
            `<span class="badge badge-secondary" style="font-size: 0.75rem;">+${center.courses.length - 2} المزيد</span>` : 
            ''
          }
        </div>
        
        <button class="btn btn-primary w-full" onclick="showCenterDetails('${center.id}')">
          عرض التفاصيل والدورات
        </button>
      </div>
    </div>
  `;
}

// إنشاء بطاقة دورة
function createCourseCard(course) {
  return `
    <div class="card">
      <div class="card-header" style="padding-bottom: 0.75rem;">
        <div class="flex justify-between items-start gap-3 mb-3">
          <h4 style="margin: 0; line-height: 1.4;">${course.name}</h4>
          <span class="badge badge-${getLevelClass(course.level)}" style="flex-shrink: 0;">${course.level}</span>
        </div>
        <p style="color: var(--muted); margin: 0; line-height: 1.4;">${course.description}</p>
      </div>
      
      <div class="card-content" style="padding-top: 0;">
        <div class="grid grid-cols-1 gap-3 text-sm mb-4">
          <div class="flex items-center gap-2">
            <svg class="icon icon-sm" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>${course.centerName} - ${course.centerCity}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <svg class="icon icon-sm" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>${course.instructor}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <svg class="icon icon-sm" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>${course.duration}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <svg class="icon icon-sm" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            <span style="font-weight: 500;">${course.price} دينار اردني</span>
          </div>
        </div>
        
        <div style="border-top: 1px solid var(--border); padding-top: 0.75rem; margin-bottom: 1rem;">
          <p style="font-size: 0.875rem; color: var(--muted); margin-bottom: 0.5rem;">الجدول الزمني:</p>
          <p style="font-size: 0.875rem; margin: 0;">${course.schedule}</p>
        </div>
        
        <div class="flex gap-2">
          <button class="btn btn-primary" style="flex: 1; font-size: 0.875rem;">
            التسجيل في الدورة
          </button>
          <button class="btn btn-outline" style="flex: 1; font-size: 0.875rem;" onclick="window.location.href='centers.html'">
            عرض المركز
          </button>
        </div>
      </div>
    </div>
  `;
}

// الحصول على كلاس CSS للمستوى
function getLevelClass(level) {
  switch (level) {
    case 'مبتدئ': return 'beginner';
    case 'متوسط': return 'intermediate';
    case 'متقدم': return 'advanced';
    default: return 'secondary';
  }
}

// مسح الفلاتر
function clearFilters() {
  currentFilters = {
    searchTerm: '',
    selectedCity: 'all',
    selectedLevel: 'all',
    sortBy: 'name'
  };
  
  const searchInput = document.getElementById('search-input');
  const citySelect = document.getElementById('city-select');
  const levelSelect = document.getElementById('level-select');
  
  if (searchInput) searchInput.value = '';
  if (citySelect) citySelect.value = 'all';
  if (levelSelect) levelSelect.value = 'all';
  
  loadCenters();
}

// مسح فلاتر الدورات
function clearCoursesFilters() {
  currentFilters = {
    searchTerm: '',
    selectedCity: 'all',
    selectedLevel: 'all',
    sortBy: 'name'
  };
  
  const searchInput = document.getElementById('courses-search-input');
  const citySelect = document.getElementById('courses-city-select');
  const levelSelect = document.getElementById('courses-level-select');
  const sortSelect = document.getElementById('courses-sort-select');
  
  if (searchInput) searchInput.value = '';
  if (citySelect) citySelect.value = 'all';
  if (levelSelect) levelSelect.value = 'all';
  if (sortSelect) sortSelect.value = 'name';
  
  loadCourses();
}

// عرض تفاصيل المركز
function showCenterDetails(centerId) {
  const center = quranicCenters.find(c => c.id === centerId);
  if (!center) return;
  
  const modalHTML = `
    <div class="modal-overlay" id="center-modal" onclick="closeCenterModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>${center.name}</h2>
          <button class="modal-close" onclick="closeCenterModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="position: relative; margin-bottom: 1.5rem;">
            <img src="${center.image}" alt="${center.name}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 0.5rem;">
            <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-radius: 9999px; padding: 0.5rem 0.75rem; display: flex; align-items: center; gap: 0.25rem;">
              <span class="star">★</span>
              <span style="font-weight: 500;">${center.rating}</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-6" style="grid-template-columns: 1fr 1fr;">
            <div>
              <h3>معلومات المركز</h3>
              <p style="color: var(--muted); margin-bottom: 1rem;">${center.description}</p>
              
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div class="flex items-center gap-3">
                  <svg class="icon" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <div>
                    <p style="margin: 0;">${center.address}</p>
                    <p style="margin: 0; font-size: 0.875rem; color: var(--muted);">${center.city}</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <svg class="icon" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>${center.phone}</span>
                </div>
                
                <div class="flex items-center gap-3">
                  <svg class="icon" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>${center.email}</span>
                </div>
                
                ${center.website ? `
                  <div class="flex items-center gap-3">
                    <svg class="icon" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                    <span>${center.website}</span>
                  </div>
                ` : ''}
                
                <div class="flex items-center gap-3">
                  <svg class="icon" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0v8a2 2 0 002 2h4a2 2 0 002-2V7"/>
                  </svg>
                  <span>تأسس عام ${center.established}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3>الدورات المتاحة</h3>
                <span class="badge badge-secondary">${center.courses.length} دورة</span>
              </div>
              
              <div style="max-height: 400px; overflow-y: auto;">
                ${center.courses.map(course => `
                  <div style="border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;">
                    <div class="flex justify-between items-start mb-3">
                      <h4 style="margin: 0;">${course.name}</h4>
                      <span class="badge badge-${getLevelClass(course.level)}">${course.level}</span>
                    </div>
                    
                    <p style="font-size: 0.875rem; color: var(--muted); margin-bottom: 1rem;">${course.description}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.875rem; margin-bottom: 1rem;">
                      <div class="flex items-center gap-2">
                        <svg class="icon icon-sm" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>${course.duration}</span>
                      </div>
                      
                      <div class="flex items-center gap-2">
                        <svg class="icon icon-sm" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span>${course.instructor}</span>
                      </div>
                      
                      <div class="flex items-center gap-2" style="grid-column: 1/-1;">
                        <svg class="icon icon-sm" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0v8a2 2 0 002 2h4a2 2 0 002-2V7"/>
                        </svg>
                        <span>${course.schedule}</span>
                      </div>
                      
                      <div class="flex items-center gap-2" style="grid-column: 1/-1;">
                        <svg class="icon icon-sm" style="color: var(--muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                        <span style="font-weight: 500;">${course.price} دينار اردني </span>
                      </div>
                    </div>
                    
                    <button class="btn btn-primary btn-sm w-full">التسجيل في الدورة</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// إغلاق نافذة تفاصيل المركز
function closeCenterModal(event) {
  if (event && event.target !== event.currentTarget) return;
  
  const modal = document.getElementById('center-modal');
  if (modal) {
    modal.remove();
  }
}

// تهيئة صفحة التواصل
function initializeContactPage() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
}

// معالج إرسال نموذج التواصل
function handleContactFormSubmit(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // تغيير النص لإظهار حالة التحميل
  submitBtn.innerHTML = '<span class="spinner"></span> جاري الإرسال...';
  submitBtn.disabled = true;
  
  // محاكاة إرسال النموذج
  setTimeout(() => {
    // إخفاء النموذج وإظهار رسالة النجاح
    const formContainer = document.getElementById('form-container');
    const successMessage = document.getElementById('success-message');
    
    if (formContainer && successMessage) {
      formContainer.style.display = 'none';
      successMessage.style.display = 'block';
    }
    
    // إعادة تعيين النموذج
    e.target.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 2000);
}

// إعادة إظهار النموذج
function showContactForm() {
  const formContainer = document.getElementById('form-container');
  const successMessage = document.getElementById('success-message');
  
  if (formContainer && successMessage) {
    formContainer.style.display = 'block';
    successMessage.style.display = 'none';
  }
}

// دالة التأخير للبحث
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
