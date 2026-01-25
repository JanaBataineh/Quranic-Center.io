/* مسار الملف: js/pages/home.js */

// 1. حذفنا استيراد api.js لأنه فارغ الآن
import { createCenterCard, createCourseCard } from '../components/ui.js';
import { initTypewriter, initSlider } from '../components/animations.js';

export function initializeHomePage() {
  initTypewriter();
  initSlider();
  
  // استدعاء دالة جلب البيانات الحقيقية
  fetchHomeData();
}

async function fetchHomeData() {
    try {
        // تجهيز الرابط
        const baseUrl = window.CONFIG 
            ? window.CONFIG.getUrl(window.CONFIG.ENDPOINTS.PUBLIC) 
            : 'http://localhost:5220/api/Public';

        // 1. جلب المراكز
        const centersRes = await fetch(`${baseUrl}/centers`);
        const centers = await centersRes.json();
        
        // تحديث إحصائية عدد المراكز
        const centersStat = document.querySelector('[data-stat="centers"]');
        if(centersStat) centersStat.textContent = centers.length;

        // عرض المراكز المميزة (أول 3 مراكز)
        const centersContainer = document.getElementById('featured-centers');
        if (centersContainer) {
            centersContainer.innerHTML = centers.slice(0, 3).map(c => createCenterCard(c)).join('');
        }

        // 2. جلب الدورات
        const coursesRes = await fetch(`${baseUrl}/courses`);
        const courses = await coursesRes.json();

        // تحديث إحصائية عدد الدورات
        const coursesStat = document.querySelector('[data-stat="courses"]');
        if(coursesStat) coursesStat.textContent = courses.length;

        // عرض الدورات الحديثة (أول 4 دورات)
        const coursesContainer = document.getElementById('recent-courses');
        if (coursesContainer) {
            coursesContainer.innerHTML = courses.slice(0, 4).map(c => createCourseCard(c)).join('');
        }

    } catch (error) {
        console.error("فشل في تحميل بيانات الصفحة الرئيسية:", error);
    }
}