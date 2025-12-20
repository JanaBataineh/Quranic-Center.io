/* مسار الملف: js/components/navbar.js */

export function initializeNavigation() {
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