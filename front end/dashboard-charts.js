// يعتمد هذا الملف على مكتبة Chart.js وملف data.js الموجود مسبقًا
document.addEventListener('DOMContentLoaded', function() {
    // 1. استخراج البيانات من data.js
    const { totalCenters, totalCourses, cities } = getStatistics();
    const allCourses = getAllCourses();

    // 2. تحليل البيانات للمخططات

    // البيانات 1: توزيع المراكز حسب المدينة
    const centerCityCounts = quranicCenters.reduce((acc, center) => {
        acc[center.city] = (acc[center.city] || 0) + 1;
        return acc;
    }, {});

    // البيانات 2: توزيع الدورات حسب المستوى
    const courseLevelCounts = allCourses.reduce((acc, course) => {
        const level = course.level.trim();
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});
    
    // البيانات 3: عدد الدورات لكل مركز
    const coursesPerCenter = allCourses.reduce((acc, course) => {
        acc[course.centerName] = (acc[course.centerName] || 0) + 1;
        return acc;
    }, {});


    // 3. الدوال لإنشاء المخططات

    // المخطط 1: المراكز حسب المدينة (شريطي)
    function drawCentersByCityChart() {
        const ctx = document.getElementById('centersByCityChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(centerCityCounts),
                datasets: [{
                    label: 'عدد المراكز',
                    data: Object.values(centerCityCounts),
                    backgroundColor: [
                        '#87986A',
                        '#718355', 
                        '#5A6B47',
                        '#A0B18B'
                    ],
                    borderColor: '#718355',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'توزيع المراكز حسب المدينة',
                        font: { size: 16 }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // المخطط 2: الدورات حسب المستوى (دائري)
    function drawCoursesByLevelChart() {
        const ctx = document.getElementById('coursesByLevelChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(courseLevelCounts),
                datasets: [{
                    label: 'عدد الدورات',
                    data: Object.values(courseLevelCounts),
                    backgroundColor: [
                        '#A0B18B', // مبتدئ
                        '#718355', // متوسط
                        '#1e40af'  // متقدم
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'توزيع الدورات حسب المستوى',
                        font: { size: 16 }
                    }
                }
            }
        });
    }

    // المخطط 3: عدد الدورات لكل مركز (شريطي أفقي)
    function drawCoursesPerCenterChart() {
        const ctx = document.getElementById('coursesPerCenterChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(coursesPerCenter),
                datasets: [{
                    label: 'عدد الدورات',
                    data: Object.values(coursesPerCenter),
                    backgroundColor: '#1e40af', 
                    borderColor: '#1e40af',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // مخطط شريطي أفقي
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'عدد الدورات لكل مركز',
                        font: { size: 16 }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // 4. استدعاء دوال الرسم
    drawCentersByCityChart();
    drawCoursesByLevelChart();
    drawCoursesPerCenterChart();
});