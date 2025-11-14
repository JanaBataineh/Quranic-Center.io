// 🌟 جديد: تعريف رابط الـ API العام
const PUBLIC_API_URL = 'https://quranic-centerio-production.up.railway.app/api/Public';

// 🌟 جديد: متغيرات لحفظ البيانات المجلوبة من الـ API
let apiCenters = [];
let apiCourses = [];
let apiStats = {};

// متغيرات عامة للفلاتر (كما هي)
let currentFilters = {
  searchTerm: '',
  selectedCity: 'all',
  selectedLevel: 'all',
  sortBy: 'name'
};

// ----------------------------------------------------
// 🌟 تحديث: تهيئة التطبيق (أصبحت Async)
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async function() {
  initializeNavigation();
  
  // 🌟 جديد: جلب البيانات من الـ API أولاً
  await loadApiData();
  
  // (ثانياً) تشغيل الصفحة التي نحن فيها
  initializePage();
});

// 🌟 جديد: دالة لجلب جميع بيانات الـ API المطلوبة
async function loadApiData() {
  try {
    // (استخدام Promise.all لجلبها معاً)
    const [centersRes, coursesRes, statsRes] = await Promise.all([
      fetch(`${PUBLIC_API_URL}/centers`),
      fetch(`${PUBLIC_API_URL}/courses`),
      fetch(`${PUBLIC_API_URL}/stats`)
    ]);

    if (!centersRes.ok || !coursesRes.ok || !statsRes.ok) {
      throw new Error('فشل تحميل البيانات من الـ API');
    }

    apiCenters = await centersRes.json();
    apiCourses = await coursesRes.json();
    apiStats = await statsRes.json();

    console.log("تم تحميل بيانات الـ API بنجاح:", { apiCenters, apiCourses, apiStats });

  } catch (error) {
    console.error(error);
    // (يمكنك عرض رسالة خطأ للمستخدم هنا)
  }
}

// ----------------------------------------------------
// (دوال التنقل وتهيئة الصفحة تبقى كما هي)
// ----------------------------------------------------
function initializeNavigation() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }
  
  document.addEventListener('click', function(e) {
    if (!mobileMenuBtn?.contains(e.target) && !navMenu?.contains(e.target)) {
      navMenu?.classList.remove('active');
    }
  });
}

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

// ----------------------------------------------------
// 🌟 تحديث: الدوال أصبحت تعتمد على بيانات الـ API
// ----------------------------------------------------

// تهيئة الصفحة الرئيسية
function initializeHomePage() {
  loadStatistics();
  loadFeaturedCenters();
  loadRecentCourses();
}

// تحميل الإحصائيات (من بيانات الـ API)
function loadStatistics() {
  const statElements = document.querySelectorAll('[data-stat]');
  
  statElements.forEach(element => {
    const statType = element.getAttribute('data-stat');
    switch(statType) {
      case 'centers':
        element.textContent = apiStats.totalCenters || 0;
        break;
      case 'courses':
        element.textContent = apiStats.totalCourses || 0;
        break;
      case 'cities':
        element.textContent = apiStats.totalCities || 0;
        break;
    }
  });
}

// تحميل المراكز المميزة (من بيانات الـ API)
function loadFeaturedCenters() {
  const container = document.getElementById('featured-centers');
  if (!container) return;
  
  // (نفترض أن الترتيب يتم في الـ API، نأخذ أول 3)
  const featuredCenters = apiCenters.slice(0, 3);
  
  container.innerHTML = featuredCenters.map(center => createCenterCard(center)).join('');
}

// تحميل الدورات الحديثة (من بيانات الـ API)
function loadRecentCourses() {
  const container = document.getElementById('recent-courses');
  if (!container) return;
  
  // (نفترض أن الترتيب يتم في الـ API، نأخذ أول 4)
  const recentCourses = apiCourses.slice(0, 4);
  
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
            <span>${course.centerName} - ${course.centerCity}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>${course.duration}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ----------------------------------------------------
// (صفحة المراكز وصفحة الدورات)
// ----------------------------------------------------

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

// تحميل إحصائيات الدورات (من بيانات الـ API)
function loadCoursesStatistics() {
  const allCourses = apiCourses;
  const stats = {
    totalCourses: allCourses.length,
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
      case 'beginner':
        element.textContent = stats.beginnerCourses;
        break;
      case 'advanced':
        element.textContent = stats.advancedCourses;
        break;
    }
  });
}

// 🌟 تحديث: تهيئة البحث (المدن أصبحت من الـ API)
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  const citySelect = document.getElementById('city-select');
  const levelSelect = document.getElementById('level-select');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  // تحميل المدن في القائمة المنسدلة (من الـ API)
  if (citySelect) {
    const cities = apiStats.cities || [];
    citySelect.innerHTML = '<option value="all">جميع المدن</option>' +
      cities.map(city => `<option value="${city}">${city}</option>`).join('');
  }
  
  // (باقي ربط الأحداث كما هو)
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

// 🌟 تحديث: تهيئة البحث للدورات (المدن أصبحت من الـ API)
function initializeCoursesSearch() {
  const searchInput = document.getElementById('courses-search-input');
  const citySelect = document.getElementById('courses-city-select');
  const levelSelect = document.getElementById('courses-level-select');
  const sortSelect = document.getElementById('courses-sort-select');
  const clearFiltersBtn = document.getElementById('courses-clear-filters');
  
  // تحميل المدن في القائمة المنسدلة (من الـ API)
  if (citySelect) {
    const cities = apiStats.cities || [];
    citySelect.innerHTML = '<option value="all">جميع المدن</option>' +
      cities.map(city => `<option value="${city}">${city}</option>`).join('');
  }
  
  // (باقي ربط الأحداث كما هو)
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

// 🌟 تحديث: تحميل المراكز (من مصفوفة الـ API)
function loadCenters() {
  const container = document.getElementById('centers-grid');
  const resultsCount = document.getElementById('results-count');
  if (!container) return;
  
  const filteredCenters = filterCenters(apiCenters); // <-- تغيير هنا
  
  if (resultsCount) {
    resultsCount.textContent = `${filteredCenters.length} من ${apiCenters.length}`; // <-- تغيير هنا
  }
  
  if (filteredCenters.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12" style="grid-column: 1/-1;">
        <h3>لا توجد مراكز</h3>
        <p class="text-muted mb-4">لم نتمكن من العثور على مراكز تطابق البحث أو الفلاتر المحددة</p>
        <button class="btn btn-primary" onclick="clearFilters()">مسح جميع الفلاتر</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredCenters.map(center => createCenterCard(center)).join('');
}

// 🌟 تحديث: تحميل الدورات (من مصفوفة الـ API)
function loadCourses() {
  const container = document.getElementById('courses-grid');
  const resultsCount = document.getElementById('courses-results-count');
  if (!container) return;
  
  const filteredCourses = filterCourses(apiCourses); // <-- تغيير هنا
  
  if (resultsCount) {
    resultsCount.textContent = `${filteredCourses.length} من ${apiCourses.length}`; // <-- تغيير هنا
  }
  
  if (filteredCourses.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12" style="grid-column: 1/-1;">
        <h3>لا توجد دورات</h3>
        <p class="text-muted mb-4">لم نتمكن من العثور على دورات تطابق البحث أو الفلاتر المحددة</p>
        <button class="btn btn-primary" onclick="clearCoursesFilters()">مسح جميع الفلاتر</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredCourses.map(course => createCourseCard(course)).join('');
}


// ----------------------------------------------------
// (جميع الدوال المساعدة (filter, createCard, ...) تبقى كما هي تقريباً)
// ----------------------------------------------------

// تصفية المراكز (تعتمد الآن على apiCenters)
function filterCenters(centers) {
  return centers.filter(center => {
    const searchTermLower = currentFilters.searchTerm.toLowerCase();
    
    // (ملاحظة: بما أن الدورات ليست مدمجة مع المراكز في هذا الـ API، سنبسط البحث)
    const matchesSearch = currentFilters.searchTerm === '' || 
      center.name.toLowerCase().includes(searchTermLower) ||
      (center.description && center.description.toLowerCase().includes(searchTermLower));

    const matchesCity = currentFilters.selectedCity === 'all' || center.city === currentFilters.selectedCity;
    
    // (ملاحظة: لا يمكن التصفية بالمستوى من هنا، يجب تعديل الـ API لإرسال الدورات مع المراكز)
    // const matchesLevel = currentFilters.selectedLevel === 'all' || 
    //   center.courses.some(course => course.level === currentFilters.selectedLevel);

    return matchesSearch && matchesCity; // && matchesLevel;
  });
}

// تصفية الدورات (تعتمد الآن على apiCourses)
function filterCourses(courses) {
  let filtered = courses.filter(course => {
    const searchTermLower = currentFilters.searchTerm.toLowerCase();
    
    const matchesSearch = currentFilters.searchTerm === '' || 
      course.name.toLowerCase().includes(searchTermLower) ||
      course.description.toLowerCase().includes(searchTermLower) ||
      course.instructor.toLowerCase().includes(searchTermLower) ||
      course.centerName.toLowerCase().includes(searchTermLower);

    const matchesCity = currentFilters.selectedCity === 'all' || course.centerCity === currentFilters.selectedCity;
    const matchesLevel = currentFilters.selectedLevel === 'all' || course.level === currentFilters.selectedLevel;

    return matchesSearch && matchesCity && matchesLevel;
  });

  // (باقي كود الترتيب كما هو)
  switch (currentFilters.sortBy) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - b.price);
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
  // (ملاحظة: تم حذف عرض الدورات من البطاقة لأن الـ API لا يرسلها حالياً)
  return `
    <div class="card">
      <div style="position: relative;">
        <img src="مركز الصديق.jpg" alt="${center.name}" class="card-image"> </div>
      <div class="card-header" style="padding-bottom: 0.75rem;">
        <h3 style="margin: 0; line-height: 1.4;">${center.name}</h3>
      </div>
      <div class="card-content" style="padding-top: 0;">
        <div class="flex items-center gap-2 text-sm mb-3" style="color: var(--muted);">
          <span>${center.address}, ${center.city}</span>
        </div>
        <div class="flex items-center gap-2 text-sm mb-3" style="color: var(--muted);">
          <span>${center.phone}</span>
        </div>
        <div class="flex items-center gap-2 text-sm mb-4" style="color: var(--muted);">
          <span>تأسس عام ${center.established}</span>
        </div>
        <button class="btn btn-primary w-full" onclick="showCenterDetails('${center.id}')">
          عرض التفاصيل
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
            <span>${course.centerName} - ${course.centerCity}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>${course.instructor}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>${course.duration}</span>
          </div>
          <div class="flex items-center gap-2">
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
          <button class="btn btn-outline" style="flex: 1; font-size: 0.875rem;" onclick="showCenterDetails('${course.centerId}')">
            عرض المركز
          </button>
        </div>
      </div>
    </div>
  `;
}

// (دوال مسح الفلاتر تبقى كما هي)
function clearFilters() {
  currentFilters = { searchTerm: '', selectedCity: 'all', selectedLevel: 'all', sortBy: 'name' };
  const searchInput = document.getElementById('search-input');
  const citySelect = document.getElementById('city-select');
  const levelSelect = document.getElementById('level-select');
  if (searchInput) searchInput.value = '';
  if (citySelect) citySelect.value = 'all';
  if (levelSelect) levelSelect.value = 'all';
  loadCenters();
}
function clearCoursesFilters() {
  currentFilters = { searchTerm: '', selectedCity: 'all', selectedLevel: 'all', sortBy: 'name' };
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

// 🌟 تحديث: عرض تفاصيل المركز (أصبحت تجلب الدورات الخاصة به من الـ API)
async function showCenterDetails(centerId) {
  const center = apiCenters.find(c => c.id === centerId);
  if (!center) return;

  // 1. إنشاء الـ Modal الأساسي
  const modalHTML = `
    <div class="modal-overlay" id="center-modal" onclick="closeCenterModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>${center.name}</h2>
          <button class="modal-close" onclick="closeCenterModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="grid grid-cols-1 gap-6" style="grid-template-columns: 1fr 1fr;">
            <div>
              <h3>معلومات المركز</h3>
              <p style="color: var(--muted); margin-bottom: 1rem;">${center.description || 'لا يوجد وصف متاح.'}</p>
              </div>
            <div>
              <h3>الدورات المتاحة</h3>
              <div id="modal-courses-list" style="max-height: 400px; overflow-y: auto;">
                <p>جاري تحميل الدورات...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // 2. 🌟 جلب الدورات الخاصة بهذا المركز
  try {
    const response = await fetch(`${PUBLIC_API_URL}/courses?centerId=${centerId}`); // (ملاحظة: الـ API الحالي لا يدعم هذا الفلتر بعد)
    
    // (حل بديل: فلترة الدورات المجلوبة مسبقاً)
    const coursesForCenter = apiCourses.filter(c => c.centerId === centerId);
    const coursesListContainer = document.getElementById('modal-courses-list');

    if (coursesForCenter.length === 0) {
      coursesListContainer.innerHTML = '<p>لا توجد دورات معتمدة في هذا المركز حالياً.</p>';
      return;
    }

    // (عرض الدورات)
    coursesListContainer.innerHTML = coursesForCenter.map(course => `
      <div style="border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;">
        <div class="flex justify-between items-start mb-3">
          <h4 style="margin: 0;">${course.name}</h4>
          <span class="badge badge-${getLevelClass(course.level)}">${course.level}</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--muted); margin-bottom: 1rem;">${course.description}</p>
        <button class="btn btn-primary btn-sm w-full">التسجيل في الدورة</button>
      </div>
    `).join('');

  } catch (error) {
    document.getElementById('modal-courses-list').innerHTML = '<p>خطأ في تحميل الدورات.</p>';
  }
}

// (دالة إغلاق الـ Modal كما هي)
function closeCenterModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('center-modal');
  if (modal) modal.remove();
}

// ----------------------------------------------------
// (صفحة اتصل بنا - كما هي)
// ----------------------------------------------------
function initializeContactPage() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
}
function handleContactFormSubmit(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="spinner"></span> جاري الإرسال...';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    const formContainer = document.getElementById('form-container');
    const successMessage = document.getElementById('success-message');
    if (formContainer && successMessage) {
      formContainer.style.display = 'none';
      successMessage.style.display = 'block';
    }
    e.target.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 2000);
}
function showContactForm() {
  const formContainer = document.getElementById('form-container');
  const successMessage = document.getElementById('success-message');
  if (formContainer && successMessage) {
    formContainer.style.display = 'block';
    successMessage.style.display = 'none';
  }
}

// (دالة debounce كما هي)
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

// (دوال مساعدة لـ getLevelClass - من الملف القديم)
function getLevelClass(level) {
    if (level === 'مبتدئ') return 'beginner';
    if (level === 'متوسط') return 'intermediate';
    if (level === 'متقدم') return 'advanced';
    return 'default';
}