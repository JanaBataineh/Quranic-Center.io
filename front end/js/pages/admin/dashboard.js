// 🌟🌟 dashbord.js - كود موحد لجلب البيانات ورسم المخططات 🌟🌟
// الرابط المحلي (لاحظ بدون Auth في النهاية)
const API_BASE_URL = CONFIG.API_BASE_URL;
async function loadAdminDashboardData() {
  // 💡 التحقق من التوكن (الذي أصبح حقيقياً الآن)
  const token = localStorage.getItem('authToken'); 
  if (!token) {
    console.error("No authorization token found. Redirecting to login.");
    // إذا لم يكن هناك توكن، قم بتسجيل الخروج
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    // أ. جلب جميع البيانات اللازمة بالتوازي
    const [statsRes, centersRes, coursesRes] = await Promise.all([
        // جلب الإحصائيات الخاصة بالإدارة
        fetch(`${API_BASE_URL}/Admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }),
        // نستخدم الواجهة العامة لجلب المراكز والدورات لرسم المخططات
        fetch(`${API_BASE_URL}/Public/centers`),
        fetch(`${API_BASE_URL}/Public/courses`)
    ]);

    if (!statsRes.ok || !centersRes.ok || !coursesRes.ok) {
        // في حال كان الرد 401 أو 403 (عدم صلاحية)، يجب إعادة التوجيه
        if (statsRes.status === 401 || statsRes.status === 403) {
            console.error('Authorization failed. Redirecting.');
            localStorage.removeItem('isAdmin');
            window.location.href = 'login.html';
            return;
        }
        throw new Error('فشل جلب إحصائيات لوحة التحكم.');
    }

    const stats = await statsRes.json(); 
    const allCenters = await centersRes.json();
    const allCourses = await coursesRes.json();

    // ب. تحديث بطاقات الإحصائيات العامة
    document.getElementById('centersCount').textContent = stats.totalCenters;
    document.getElementById('coursesCount').textContent = stats.totalCourses;
    document.getElementById('usersCount').textContent = stats.totalUsers;
    
    // حساب المدن الفريدة من المراكز المعتمدة
    const uniqueCities = allCenters.map(c => c.city).filter((v, i, a) => a.indexOf(v) === i);
    document.getElementById('citiesCount').textContent = uniqueCities.length;
    
    // ج. تحديث بطاقات الإجراءات المطلوبة
    document.getElementById('pendingCentersCount').textContent = stats.pendingCenters;
    document.getElementById('pendingCoursesCount').textContent = stats.pendingCourses;
    document.getElementById('newMessagesCount').textContent = stats.newMessages;

    // د. رسم المخططات
    initializeCharts(allCenters, allCourses);

  } catch (error) {
    console.error("Error loading admin data:", error);
    // يمكن عرض رسالة خطأ في مكان معين في لوحة التحكم
  }
}

// ------------------------------------------------------------------
// 2. منطق رسم المخططات (الذي كان سابقاً في dashboard-charts.js)
// ------------------------------------------------------------------

function initializeCharts(allCenters, allCourses) {
    // 💡 نستخدم مكتبة Chart.js التي تم استدعاؤها في dashbord.html
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library is not loaded.");
        return;
    }
    
    // أ. تحليل البيانات
    const centerMap = allCenters.reduce((map, center) => {
        map[center.id] = center.name;
        return map;
    }, {});
    
    const centerCityCounts = allCenters.reduce((acc, center) => {
        acc[center.city] = (acc[center.city] || 0) + 1;
        return acc;
    }, {});

    const courseLevelCounts = allCourses.reduce((acc, course) => {
        const level = course.level.trim();
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});
    
    const coursesPerCenter = allCourses.reduce((acc, course) => {
        // نستخدم ID المركز من الدورة لجلب اسمه من الخريطة
        const centerName = centerMap[course.centerId] || 'مركز غير معتمد'; 
        acc[centerName] = (acc[centerName] || 0) + 1;
        return acc;
    }, {});

// في ملف dashbord.js

// دالة لتحديث بطاقة إحصائيات المدن
function updateCityProgressBar(cityCounts) {
    const container = document.getElementById('city-progress-container');
    const totalDisplay = document.getElementById('totalCentersDisplay');
    
    // حساب الإجمالي
    const total = Object.values(cityCounts).reduce((a, b) => a + b, 0);
    totalDisplay.textContent = total;

    // تفريغ القائمة القديمة
    container.innerHTML = '';

    // مصفوفة الألوان لاستخدامها بالترتيب
    const colors = ['fill-blue', 'fill-purple', 'fill-cyan', 'fill-pink'];
    
    // تحويل الكائن إلى مصفوفة وترتيبها من الأكثر للأقل
    const sortedCities = Object.entries(cityCounts)
        .sort(([,a], [,b]) => b - a);

    // إنشاء شريط لكل مدينة
    sortedCities.forEach(([city, count], index) => {
        const percent = total === 0 ? 0 : (count / total) * 100;
        const colorClass = colors[index % colors.length]; // تدوير الألوان

        const rowHtml = `
            <div class="prog-row">
                <span class="prog-label" style="width: 80px;">${city}</span>
                <div class="prog-track">
                    <div class="prog-fill ${colorClass}" style="width: ${percent}%"></div>
                </div>
                <span class="prog-count">${count}</span>
            </div>
        `;
        
        container.innerHTML += rowHtml;
    });

}

// ⚠️ لا تنسَ استدعاء هذه الدالة داخل initializeCharts بدلاً من drawCentersByCityChart
// استبدل السطر القديم بهذا:
updateCityProgressBar(centerCityCounts);

  // داخل دالة initializeCharts في dashbord.js

// ... الكود السابق ...

// بدلاً من رسم Pie Chart، سنقوم بتحديث HTML البطاقة الجديدة
function updateLevelProgressBar(counts) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    // تحديث الرقم الكبير
    document.getElementById('totalCoursesDisplay').textContent = total;

    // دالة مساعدة لحساب النسبة
    const getPercent = (val) => total === 0 ? 0 : (val / total) * 100;

    // 1. مبتدئ
    const beginnerCount = counts['مبتدئ'] || 0;
    document.getElementById('count-beginner').textContent = beginnerCount;
    document.getElementById('bar-beginner').style.width = `${getPercent(beginnerCount)}%`;

    // 2. متوسط
    const intermediateCount = counts['متوسط'] || 0;
    document.getElementById('count-intermediate').textContent = intermediateCount;
    document.getElementById('bar-intermediate').style.width = `${getPercent(intermediateCount)}%`;

    // 3. متقدم
    const advancedCount = counts['متقدم'] || 0;
    document.getElementById('count-advanced').textContent = advancedCount;
    document.getElementById('bar-advanced').style.width = `${getPercent(advancedCount)}%`;
}

// استدعاء الدالة بدلاً من الشارت القديم
updateLevelProgressBar(courseLevelCounts);

    function drawCoursesPerCenterChart(counts) {
        const ctx = document.getElementById('coursesPerCenterChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: 'عدد الدورات',
                    data: Object.values(counts),
                    backgroundColor: '#1e40af', 
                    borderColor: '#1e40af',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: { title: { display: true, text: 'عدد الدورات لكل مركز', font: { size: 16 } }, legend: { display: false } },
                scales: { x: { beginAtZero: true } }
            }
        });
    }

    // ج. استدعاء دوال الرسم
    drawCentersByCityChart(centerCityCounts);
    drawCoursesByLevelChart(courseLevelCounts);
    drawCoursesPerCenterChart(coursesPerCenter);

// دالة رسم مخطط الدائرة المجوفة للمستويات
function drawCoursesLevelDoughnut(counts) {
    const ctx = document.getElementById('coursesLevelDoughnut');
    if (!ctx) return;

    // تجهيز البيانات
    const beginner = counts['مبتدئ'] || 0;
    const intermediate = counts['متوسط'] || 0;
    const advanced = counts['متقدم'] || 0;
    const total = beginner + intermediate + advanced;

    // تحديث الرقم في المنتصف
    document.getElementById('totalLevelCount').textContent = total;

    // تحديث النسب في المفتاح (Legend)
    const getPercent = (val) => total === 0 ? '0%' : Math.round((val / total) * 100) + '%';
    document.getElementById('legend-beginner').textContent = getPercent(beginner);
    document.getElementById('legend-intermediate').textContent = getPercent(intermediate);
    document.getElementById('legend-advanced').textContent = getPercent(advanced);

    // رسم المخطط
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['مبتدئ', 'متوسط', 'متقدم'],
            datasets: [{
                data: [beginner, intermediate, advanced],
                backgroundColor: [
                    '#00e676', // أخضر (مبتدئ)
                    '#ffea00', // أصفر (متوسط)
                    '#ff3d00'  // أحمر (متقدم)
                ],
                borderWidth: 0, // إزالة الحدود البيضاء
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // حجم التجويف الداخلي (اجعله كبيراً ليصبح حلقة رفيعة)
            plugins: {
                legend: { display: false }, // إخفاء مفتاح الألوان الافتراضي لأننا صممنا واحد خاص
                tooltip: { enabled: true }
            }
        }
    });
}
}


document.addEventListener('DOMContentLoaded', loadAdminDashboardData);