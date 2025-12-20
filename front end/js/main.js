/* js/main.js */

// 1. الملف الرئيسي
import '../css/main.css';

// 2. الأدوات والأيقونات (من مجلد utils)
import '../css/utils/Utility Classes.css';
import '../css/utils/Layout Utilities.css';
import '../css/utils/icon.css';
import '../css/utils/form.css';       // تأكد من موقعه (غالباً في utils أو components)
import '../css/utils/Badges.css';     // تأكد من موقعه
import '../css/utils/Animations_Typewriter.css';
import '../css/utils/search.css';
import '../css/utils/notification.css';
import '../css/utils/Modal Helpers.css';
import '../css/utils/media.css';      // يفضل تحميل الميديا في الآخر

// 3. المكونات (من مجلد components)
import '../css/components/Components_Buttons.css';
import '../css/components/Components_Cards.css';
import '../css/components/Components_Navigation.css';
import '../css/components/Components_Modals.css';
import '../css/components/Components_CustomDropdown.css';
import '../css/components/Components_Segmented Control.css';
import '../css/components/Components_InfiniteScroller.css';
import '../css/components/Components_Ratings.css';
import '../css/components/Components_Alerts&Feedback.css';
import '../css/components/AdminComponents_DataTables.css'; // إذا كان هنا

// 4. الأقسام (من مجلد sections)
import '../css/sections/Section_hero.css';
import '../css/sections/Section_login.css';
import '../css/sections/Sections_Statistics.css';
import '../css/sections/Sections_Why Choose Us.css';
import '../css/sections/Sections_Footer.css';

// 5. صفحات محددة (من مجلد pages)
import '../css/pages/Page_Specifics.css';
import '../css/pages/Page_CentersHeader.css';
import '../css/pages/users.css';

// 6. لوحة التحكم (من مجلد dashboard)
import '../css/dashboard/Dashboard_BaseLayout.css';
import '../css/dashboard/Dashboard_Sidebar.css';
import '../css/dashboard/Dashboard_StatCards.css';
import '../css/dashboard/Dashboard_ProgressCharts.css';
import '../css/dashboard/Dashboard_GridLayouts.css';
import '../css/dashboard/Dashboard_IconsUtilities.css';
import '../css/dashboard/Dashboard_ContentArea.css';


/* --- Logic Imports (الجافاسكربت) --- */
import { initializeNavigation } from './components/navbar.js';
import { loadApiData } from './data/api.js';
import { setupModalListeners } from './components/ui.js';

import { initializeHomePage } from './pages/home.js';
import { initializeCentersPage } from './pages/centers.js';
import { initializeCoursesPage } from './pages/courses.js';
import { initializeContactPage } from './pages/contact.js';

// =========================================================
// Main Entry Point
// =========================================================
document.addEventListener('DOMContentLoaded', async function() {
    
    initializeNavigation();
    setupModalListeners();
    checkAuthStatus(); 
    await loadApiData();
  
    const page = document.body.getAttribute('data-page');
    
    if (page === 'home') initializeHomePage();
    else if (page === 'centers') initializeCentersPage();
    else if (page === 'courses') initializeCoursesPage();
    else if (page === 'contact' && typeof initializeContactPage === 'function') initializeContactPage();

    // Dropdown Close Logic
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('userDropdownMenu');
        const btn = document.getElementById('userMenuBtn'); 
        if (menu && btn && !menu.classList.contains('hidden')) {
            if (!menu.contains(event.target) && !btn.contains(event.target)) {
                menu.classList.add('hidden');
            }
        }
    });
});

// Auth Functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const navUserName = document.getElementById('navUserName');
    const navUserEmail = document.getElementById('navUserEmail');
    const dashboardLink = document.getElementById('dashboardLink');

    if (token) {
        if(guestNav) guestNav.classList.add('hidden');    
        if(userNav) userNav.classList.remove('hidden');   

        const email = localStorage.getItem('currentStudentEmail') || 'مستخدم';
        const userType = localStorage.getItem('currentUserType');
        const name = localStorage.getItem('currentUserName') || email.split('@')[0]; 
        
        if(navUserEmail) navUserEmail.textContent = email;
        if(navUserName) navUserName.textContent = name;
        
        if (dashboardLink) {
            if (userType === 'Center' || userType === 'center') dashboardLink.href = 'dashbordcenters.html';
            else if (userType === 'Admin' || userType === 'admin') dashboardLink.href = 'dashbord.html';
            else dashboardLink.href = 'student-dashboard.html';
        }
    } else {
        if(guestNav) guestNav.classList.remove('hidden'); 
        if(userNav) userNav.classList.add('hidden');      
    }
}

window.toggleUserMenu = function() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.classList.toggle('hidden');
};

window.logoutUser = function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserType');
    localStorage.removeItem('currentStudentEmail');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('isStudent');
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
};