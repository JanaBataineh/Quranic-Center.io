/* مسار الملف: js/components/ui.js */
import { apiCenters, apiCourses } from '../data/api.js';
import { getLevelClass } from '../utils/helpers.js';

// 1. إنشاء بطاقة المركز
export function createCenterCard(center) {
  return `
    <div class="card">
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
        <button class="btn btn-primary w-full btn-details" data-id="${center.id}">
          عرض التفاصيل
        </button>
      </div>
    </div>
  `;
}

// 2. إنشاء بطاقة الدورة
export function createCourseCard(course) {
  return `
    <div class="card">
      <div class="card-header pb-3"> 
        <div class="flex justify-between items-start gap-3 mb-3">
          <h4>${course.name}</h4>
          <span class="badge badge-${getLevelClass(course.level)} shrink-0">${course.level}</span>
        </div>
        <p class="text-muted m-0">${course.description}</p>
      </div>
      <div class="card-content pt-0">
        <div class="info-box mb-4">
           <span class="text-light">${course.centerName} - ${course.centerCity}</span>
           <br>
           <span class="font-bold text-primary">${course.price} د.أ</span>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm flex-1 btn-enroll" data-id="${course.id}">التسجيل</button>
          <button class="btn btn-glass btn-sm flex-1 btn-details" data-id="${course.centerId}">المركز</button>
        </div>
      </div>
    </div>
  `;
}

// 3. مستمع الأحداث (Setup Listeners)
export function setupModalListeners() {
    document.addEventListener('click', (e) => {
        // أ. فتح المودال
        const btn = e.target.closest('.btn-details');
        if (btn) {
            const centerId = btn.getAttribute('data-id');
            console.log("🔘 تم الضغط على زر التفاصيل:", centerId);
            showCenterDetails(centerId);
        }

        // ب. زر التسجيل في الدورة
        const enrollBtn = e.target.closest('.btn-enroll');
        if (enrollBtn) {
            const courseId = enrollBtn.getAttribute('data-id');
            enrollInCourse(courseId);
        }

        // ج. إغلاق المودال
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
            closeCenterModal();
        }
    });
}

// 4. منطق فتح المودال
async function showCenterDetails(centerId) {
  // استخدام == للمقارنة المتساهلة (نص مع رقم)
  const center = apiCenters.find(c => c.id == centerId);
  
  if (!center) {
      console.error(`❌ لم يتم العثور على المركز رقم: ${centerId}`);
      return;
  }

  // إزالة أي مودال قديم إن وجد
  closeCenterModal();

  const modalHTML = `
    <div class="modal-overlay active" id="center-modal">
      <div class="modal-content">
        <div class="modal-header" style="justify-content: flex-end;">
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <h1 style="color: #dcfce7; margin-top:0;">${center.name}</h1>
            <p>${center.description || 'لا يوجد وصف متاح.'}</p>
            <div style="margin: 1rem 0; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <p><strong>العنوان:</strong> ${center.city} - ${center.address}</p>
                <p><strong>الهاتف:</strong> ${center.phone}</p>
                <p><strong>البريد:</strong> ${center.email}</p>
            </div>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 1rem 0;">
            <h3>الدورات المتاحة</h3>
            <div id="modal-courses-list"></div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // عرض الدورات داخل المودال
  const coursesForCenter = apiCourses.filter(c => c.centerId == centerId);
  const list = document.getElementById('modal-courses-list');
  
  if (coursesForCenter.length === 0) {
      list.innerHTML = '<p class="text-muted">لا توجد دورات متاحة حالياً في هذا المركز.</p>';
  } else {
      list.innerHTML = coursesForCenter.map(c => `
        <div style="background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 0.5rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h4 style="margin:0; color:white;">${c.name}</h4>
                <span class="text-sm text-muted">${c.level} | ${c.price} د.أ</span>
            </div>
            <button class="btn btn-sm btn-primary btn-enroll" data-id="${c.id}">تسجيل</button>
        </div>
      `).join('');
  }
}

// 5. منطق إغلاق المودال
function closeCenterModal() {
    const modal = document.getElementById('center-modal');
    if (modal) modal.remove();
}

// 6. منطق التسجيل
async function enrollInCourse(courseId) {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('currentUserType');

    if (!token) {
        if(confirm("يجب تسجيل الدخول أولاً. الذهاب لصفحة الدخول؟")) {
            window.location.href = 'login.html';
        }
        return;
    }
    if (userType !== 'Student') {
        alert("عذراً، التسجيل متاح لحسابات الطلاب فقط.");
        return;
    }

    try {
        const response = await fetch(`${CONFIG.getUrl(CONFIG.ENDPOINTS.STUDENT)}/enroll/${courseId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            }
        });

        if (response.ok) {
            alert("✅ تم التسجيل في الدورة بنجاح!");
            window.location.href = 'student-dashboard.html';
        } else {
            const err = await response.json();
            alert("⚠️ " + (err.message || "فشل التسجيل (ربما أنت مسجل مسبقاً)"));
        }
    } catch (error) {
        console.error(error);
        alert("❌ خطأ في الاتصال بالسيرفر");
    }
}

// 7. القوائم المنسدلة (Dropdowns)
export function setupCustomDropdown(dropdownId, inputId, onSelectCallback) {
    const dropdown = document.getElementById(dropdownId);
    const hiddenInput = document.getElementById(inputId);
    
    if (dropdown && hiddenInput) {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        const valueSpan = dropdown.querySelector('.selected-value');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-dropdown').forEach(d => { if (d !== dropdown) d.classList.remove('active'); });
            dropdown.classList.toggle('active');
        });

        menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
                e.target.classList.add('selected');
                
                const val = e.target.getAttribute('data-value');
                valueSpan.textContent = e.target.textContent;
                hiddenInput.value = val;
                
                dropdown.classList.remove('active');
                if (onSelectCallback) onSelectCallback(val);
            }
        });
    }
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
        }
    });
}