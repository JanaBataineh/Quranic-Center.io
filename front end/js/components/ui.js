/* مسار الملف: js/components/ui.js */
import { getLevelClass } from '../utils/helpers.js';

// 1. إنشاء بطاقة المركز (HTML فقط)
export function createCenterCard(center) {
  return `
    <div class="center-card">
      <div class="card-header">
        <h3>${center.name}</h3>
        <span class="badge badge-secondary">${center.city}</span>
      </div>
      <div class="card-content">
        <p><i class="icon-location"></i> ${center.address || ''}</p>
        <p><i class="icon-phone"></i> ${center.phone}</p>
        <button class="btn btn-glass w-full mt-3 btn-details" data-id="${center.id}">
            عرض التفاصيل
        </button>
      </div>
    </div>
  `;
}

// 2. إنشاء بطاقة الدورة (HTML فقط)
export function createCourseCard(course) {
  // التأكد من وجود levelClass لتجنب الأخطاء
  const levelClass = typeof getLevelClass === 'function' ? getLevelClass(course.level) : 'primary';
  
  return `
    <div class="course-card">
      <div class="card-header"> 
        <div class="flex justify-between items-start gap-3 mb-3">
          <h4>${course.name}</h4>
          <span class="badge badge-${levelClass}">${course.level || 'عام'}</span>
        </div>
      </div>
      <div class="card-content pt-0">
        <div class="info-box mb-4">
           <span class="text-light">${course.centerName || ''}</span>
           <br>
           <span class="font-bold text-primary">${course.price || 0} د.أ</span>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm flex-1 btn-enroll" data-id="${course.id}">التسجيل</button>
          <button class="btn btn-glass btn-sm flex-1 btn-details" data-id="${course.centerId}">المركز</button>
        </div>
      </div>
    </div>
  `;
}

// 3. إعداد مستمعات الأحداث (Modal & Enroll)
export function setupModalListeners() {
    // نستخدم Event Delegation للأداء الأفضل
    document.body.addEventListener('click', (e) => {
        // أ. فتح المودال عند الضغط على "عرض التفاصيل" أو "المركز"
        const btnDetails = e.target.closest('.btn-details');
        if (btnDetails) {
            const centerId = btnDetails.getAttribute('data-id');
            showCenterDetails(centerId);
        }

        // ب. زر التسجيل في الدورة
        const btnEnroll = e.target.closest('.btn-enroll');
        if (btnEnroll) {
            const courseId = btnEnroll.getAttribute('data-id');
            enrollInCourse(courseId);
        }

        // ج. إغلاق المودال
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
            closeCenterModal();
        }
    });
}

// 4. منطق فتح المودال (جلب البيانات من السيرفر)
async function showCenterDetails(centerId) {
  // إظهار مؤشر تحميل
  const loadingHTML = `
    <div class="modal-overlay active" id="center-modal">
      <div class="modal-content">
        <div class="modal-body text-center">
            <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', loadingHTML);

  try {
      const baseUrl = window.CONFIG ? window.CONFIG.getUrl(window.CONFIG.ENDPOINTS.PUBLIC) : 'http://localhost:5220/api/Public';
      
      // جلب جميع المراكز والدورات (لضمان العثور على المطلوب)
      // ملاحظة: الأفضل مستقبلاً عمل API خاص لجلب مركز واحد، لكن هذا يفي بالغرض حالياً
      const [centersRes, coursesRes] = await Promise.all([
          fetch(`${baseUrl}/centers`),
          fetch(`${baseUrl}/courses`)
      ]);

      const centers = await centersRes.json();
      const courses = await coursesRes.json();

      const center = centers.find(c => c.id == centerId);
      
      // إزالة مودال التحميل
      closeCenterModal();

      if (!center) {
          alert("عذراً، لم يتم العثور على بيانات المركز.");
          return;
      }

      // تصفية الدورات الخاصة بهذا المركز
      const coursesForCenter = courses.filter(c => c.centerId == centerId);

      // رسم المودال الحقيقي
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
                    <p><strong>العنوان:</strong> ${center.city} - ${center.address || ''}</p>
                    <p><strong>الهاتف:</strong> ${center.phone}</p>
                </div>
                <hr style="border-color: rgba(255,255,255,0.1); margin: 1rem 0;">
                <h3>الدورات المتاحة</h3>
                <div id="modal-courses-list">
                    ${coursesForCenter.length === 0 ? '<p class="text-muted">لا توجد دورات حالياً.</p>' : ''}
                    ${coursesForCenter.map(c => `
                        <div style="background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 0.5rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin:0; color:white;">${c.name}</h4>
                                <span class="text-sm text-muted">${c.level || ''} | ${c.price} د.أ</span>
                            </div>
                            <button class="btn btn-sm btn-primary btn-enroll" data-id="${c.id}">تسجيل</button>
                        </div>
                    `).join('')}
                </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);

  } catch (error) {
      console.error(error);
      closeCenterModal();
      alert("حدث خطأ في جلب التفاصيل.");
  }
}

// 5. إغلاق المودال
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
        // استخدام window.CONFIG هنا
        const baseUrl = window.CONFIG ? window.CONFIG.getUrl(window.CONFIG.ENDPOINTS.STUDENT) : 'http://localhost:5220/api/Student';
        
        const response = await fetch(`${baseUrl}/enroll/${courseId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            }
        });

        if (response.ok) {
            alert("✅ تم التسجيل في الدورة بنجاح!");
            window.location.href = 'master-student-portal.html'; // أو الصفحة المناسبة
        } else {
            const err = await response.json();
            alert("⚠️ " + (err.message || "فشل التسجيل (ربما أنت مسجل مسبقاً)"));
        }
    } catch (error) {
        console.error(error);
        alert("❌ خطأ في الاتصال بالسيرفر");
    }
}

// 7. القوائم المنسدلة
export function setupCustomDropdown(dropdownId, inputId, onSelectCallback) {
    const dropdown = document.getElementById(dropdownId);
    const hiddenInput = document.getElementById(inputId);
    
    if (dropdown && hiddenInput) {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        const valueSpan = dropdown.querySelector('.selected-value');

        // إزالة المستمعين القدامى (لتجنب التكرار إذا استدعيت الدالة مرتين)
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);
        
        const newMenu = menu.cloneNode(true);
        menu.parentNode.replaceChild(newMenu, menu);

        // إضافة المستمعين الجدد
        newTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-dropdown').forEach(d => { if (d !== dropdown) d.classList.remove('active'); });
            dropdown.classList.toggle('active');
        });

        newMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                newMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
                e.target.classList.add('selected');
                
                const val = e.target.getAttribute('data-value');
                valueSpan.textContent = e.target.textContent;
                hiddenInput.value = val;
                
                dropdown.classList.remove('active');
                if (onSelectCallback) onSelectCallback(val);
            }
        });
    }
    
    // إغلاق القائمة عند النقر خارجها (مرة واحدة فقط للصفحة)
    if (!window.dropdownListenerAdded) {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown')) {
                document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
            }
        });
        window.dropdownListenerAdded = true;
    }
}