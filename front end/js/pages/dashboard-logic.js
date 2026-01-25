document.addEventListener('DOMContentLoaded', async function () {
    const API_URL = "http://localhost:5220/api"; // أو استخدم CONFIG.API_BASE_URL
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // 1. جلب البيانات من السيرفر
        const [statsRes, centersRes, coursesRes] = await Promise.all([
            fetch(`${API_URL}/Admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_URL}/Public/centers`),
            fetch(`${API_URL}/Public/courses`)
        ]);

        if (!statsRes.ok) throw new Error("فشل جلب الإحصائيات");

        const stats = await statsRes.json();
        const centers = await centersRes.json();
        const courses = await coursesRes.json();

        // 2. تحديث العدادات (Cards)
        updateElement('centersCount', stats.totalCenters);
        updateElement('coursesCount', stats.totalCourses);
        updateElement('usersCount', stats.totalUsers);
        
        // حساب المدن الفريدة
        const uniqueCities = [...new Set(centers.map(c => c.city))];
        updateElement('citiesCount', uniqueCities.length);

        // تحديث القوائم الجانبية (الإجراءات المعلقة)
        updateElement('pendingCentersCount', stats.pendingCenters || 0);
        updateElement('pendingCoursesCount', stats.pendingCourses || 0);
        updateElement('newMessagesCount', stats.newMessages || 0);

        // 3. رسم المخططات البيانية (Charts)
        initCharts(centers, courses);

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
});

// دالة مساعدة لتحديث النص بأمان
function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// دالة تهيئة الرسومات
function initCharts(centers, courses) {
    // أ) مخطط توزيع المراكز حسب المدينة (Bar Chart)
    const cityCounts = centers.reduce((acc, c) => {
        acc[c.city] = (acc[c.city] || 0) + 1;
        return acc;
    }, {});

    const ctxCity = document.getElementById('centersByCityChart');
    if (ctxCity) {
        new Chart(ctxCity, {
            type: 'bar',
            data: {
                labels: Object.keys(cityCounts),
                datasets: [{
                    label: 'عدد المراكز',
                    data: Object.values(cityCounts),
                    backgroundColor: '#5d87ff',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: '#2b2b40' } }, x: { grid: { display: false } } }
            }
        });
    }

    // ب) مخطط المستويات (Doughnut Chart)
    const levelCounts = courses.reduce((acc, c) => {
        const lvl = c.level ? c.level.trim() : 'غير محدد';
        acc[lvl] = (acc[lvl] || 0) + 1;
        return acc;
    }, {});

    // تحديث الأرقام داخل بطاقة المستويات
    const totalCourses = courses.length;
    updateElement('totalLevelCount', totalCourses);
    
    // حساب النسب المئوية
    const getPct = (val) => totalCourses > 0 ? Math.round((val / totalCourses) * 100) + '%' : '0%';
    updateElement('legend-beginner', getPct(levelCounts['مبتدئ'] || 0));
    updateElement('legend-intermediate', getPct(levelCounts['متوسط'] || 0));
    updateElement('legend-advanced', getPct(levelCounts['متقدم'] || 0));

    const ctxLevel = document.getElementById('coursesLevelDoughnut');
    if (ctxLevel) {
        new Chart(ctxLevel, {
            type: 'doughnut',
            data: {
                labels: ['مبتدئ', 'متوسط', 'متقدم', 'أخرى'],
                datasets: [{
                    data: [
                        levelCounts['مبتدئ'] || 0,
                        levelCounts['متوسط'] || 0,
                        levelCounts['متقدم'] || 0,
                        levelCounts['غير محدد'] || 0
                    ],
                    backgroundColor: ['#00e676', '#ffea00', '#ff3d00', '#777'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', // لجعل الدائرة رقيقة
                plugins: { legend: { display: false } }
            }
        });
    }
}
// دالة لجلب وعرض سجل النشاطات
async function loadActivityLogs() {
    // افترض أن العنصر في HTML لديه ID="activityLogContainer"
    // أو سنبحث عن العنصر الذي يحتوي على القائمة
const container = document.getElementById('recentActivityList');
    if(!container) return;

    container.innerHTML = '<p style="color:#888; text-align:center;">جاري التحميل...</p>';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5220/api/Admin/activities`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const logs = await response.json();
            
            if(logs.length === 0) {
                container.innerHTML = '<p style="color:#888; text-align:center;">لا توجد نشاطات حديثة</p>';
                return;
            }

            container.innerHTML = ''; // تفريغ الحاوية

            logs.forEach(log => {
                // حساب الوقت المنقضي (منذ 5 دقائق، منذ ساعتين..)
                const timeAgo = getTimeAgo(new Date(log.time));
                
                const item = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #222; padding-bottom: 8px;">
                        <span style="color: #e0e0e0; font-size: 0.9em;">• ${log.action}</span>
                        <span style="color: #666; font-size: 0.8em;">${timeAgo}</span>
                    </div>
                `;
                container.innerHTML += item;
            });
        }
    } catch (error) {
        console.error(error);
    }
}

// دالة مساعدة لحساب الوقت (منذ كذا...)
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + " سنة";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " شهر";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " يوم";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ساعة";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " دقيقة";
    return "الآن";
}

// استدعاء الدالة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    // ... دوال أخرى ...
    loadActivityLogs(); 
});