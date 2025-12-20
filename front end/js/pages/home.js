import { apiStats, apiCenters, apiCourses } from '../data/api.js';
import { createCenterCard, createCourseCard } from '../components/ui.js';
import { initTypewriter, initSlider } from '../components/animations.js';

export function initializeHomePage() {
  initTypewriter();
  initSlider();
  
  // الإحصائيات
  document.querySelectorAll('[data-stat]').forEach(el => {
      const type = el.getAttribute('data-stat');
      if(type === 'centers') el.textContent = apiStats.totalCenters || 0;
      if(type === 'courses') el.textContent = apiStats.totalCourses || 0;
  });

  // المراكز المميزة
  const centersContainer = document.getElementById('featured-centers');
  if (centersContainer) {
      centersContainer.innerHTML = apiCenters.slice(0, 3).map(c => createCenterCard(c)).join('');
  }

  // الدورات الحديثة
  const coursesContainer = document.getElementById('recent-courses');
  if (coursesContainer) {
      coursesContainer.innerHTML = apiCourses.slice(0, 4).map(c => createCourseCard(c)).join('');
  }
}