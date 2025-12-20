/* مسار الملف: js/data/api.js */

// تأكد أن ملف config.js تم تحميله قبل هذا الملف في الـ bundle أو HTML
// ولكن بما أننا نستخدم Webpack، يفضل أن يكون Config متغير، لكن سنعتمد على المتغير العام حالياً
const PUBLIC_API_URL = CONFIG.getUrl(CONFIG.ENDPOINTS.PUBLIC);

export let apiCenters = [];
export let apiCourses = [];
export let apiStats = {};

// متغيرات الفلترة
export let currentFilters = {
  searchTerm: '',
  selectedCity: 'all',
  selectedLevel: 'all',
  sortBy: 'name'
};

// دالة تحديث الفلاتر
export function updateFilter(key, value) {
    currentFilters[key] = value;
}

// دالة جلب البيانات
export async function loadApiData() {
  try {
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

    console.log("✅ تم تحميل البيانات:", { apiCenters, apiCourses, apiStats });

  } catch (error) {
    console.error("❌ خطأ في جلب البيانات:", error);
  }
}