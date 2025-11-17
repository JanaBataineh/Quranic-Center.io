// 🌟🌟 dashbord.js - كود موحد لجلب البيانات ورسم المخططات 🌟🌟
const API_BASE_URL = 'https://quranic-centerio-production.up.railway.app/api'; 

// ------------------------------------------------------------------
// 1. دالة جلب البيانات من API وتحديث واجهة المستخدم
// ------------------------------------------------------------------
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


    // ب. دوال الرسم
    function drawCentersByCityChart(counts) {
        const ctx = document.getElementById('centersByCityChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: 'عدد المراكز',
                    data: Object.values(counts),
                    backgroundColor: ['#87986A', '#718355', '#5A6B47', '#A0B18B'],
                    borderColor: '#718355',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: 'توزيع المراكز حسب المدينة', font: { size: 16 } }, legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    function drawCoursesByLevelChart(counts) {
        const ctx = document.getElementById('coursesByLevelChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: 'عدد الدورات',
                    data: Object.values(counts),
                    backgroundColor: ['#A0B18B', '#718355', '#1e40af'], 
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { title: { display: true, text: 'توزيع الدورات حسب المستوى', font: { size: 16 } } }
            }
        });
    }

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
}


document.addEventListener('DOMContentLoaded', loadAdminDashboardData);