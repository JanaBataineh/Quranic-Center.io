/* =========================================
   Admin Courses Logic (إدارة الدورات - API ONLY)
   ========================================= */

const API_BASE_URL = CONFIG.getUrl(CONFIG.ENDPOINTS.ADMIN);
const token = localStorage.getItem('authToken');
let isPendingFilterActive = false;
let currentCourseId = null;

// التحقق من فلتر الرابط
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('status') === 'pending') {
    isPendingFilterActive = true;
}

// 1. التهيئة
document.addEventListener('DOMContentLoaded', () => {
    renderCourses();
    updateFilterButtonText();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAddCourseModal();
    });
});

// 2. جلب البيانات من السيرفر
async function getCoursesFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("فشل الاتصال بالسيرفر");
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch courses:", error);
        alert("تعذر جلب الدورات. تأكد من تشغيل السيرفر.");
        return [];
    }
}

// 3. عرض الجدول
async function renderCourses() {
    const tableBody = document.getElementById('coursesTableBody'); // تأكد من الاسم في HTML
    if(!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#888;">جاري تحميل البيانات من السيرفر...</td></tr>';

    try {
        // ✅ جلب حقيقي فقط
        let coursesData = await getCoursesFromAPI(); 

        // تصفية
        if (isPendingFilterActive) {
            coursesData = coursesData.filter(c => c.status === 'pending');
        }

        if (!coursesData || coursesData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">لا توجد دورات متاحة في قاعدة البيانات.</td></tr>';
            return;
        }

        const rowsHtml = coursesData.map((course, index) => {
            let statusBadge = course.status === 'published' 
                ? '<span class="badge bg-success-dark">منشور</span>' 
                : '<span class="badge bg-warning-dark">معلق</span>';

            let levelClass = 'bg-info-dark'; 
            if (course.level === 'متوسط') levelClass = 'bg-warning-dark';
            if (course.level === 'متقدم') levelClass = 'bg-danger';

            return `
                <tr id="row-${course.id}">
                    <td style="color: #666; font-family: monospace;">${index + 1}</td>
                    <td style="font-weight: bold; color: #fff;">${course.courseName || course.name}</td>
                    <td style="color: #bbb;">${course.centerName || '-'}</td>
                    <td><span class="badge ${levelClass}">${course.level}</span></td>
                    <td>${course.price} د.أ</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display: flex; justify-content: center; gap: 5px;">
                            <button class="action-btn btn-edit" onclick="editCourse('${course.id}')">تعديل</button>
                            <button class="action-btn btn-delete" onclick="deleteCourse('${course.id}', '${course.name}')">حذف</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rowsHtml;

    } catch (error) {
        console.error("Error:", error);
        tableBody.innerHTML = '<tr><td colspan="7" style="color:#e74c3c; text-align:center;">حدث خطأ أثناء العرض.</td></tr>';
    }
}

// 4. وظائف التحكم
function filterCourses() {
    isPendingFilterActive = !isPendingFilterActive;
    updateFilterButtonText();
    renderCourses();
}

function updateFilterButtonText() {
    const btn = document.getElementById('filterBtn');
    if(!btn) return;
    if (isPendingFilterActive) {
        btn.textContent = "عرض كل الدورات";
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-glass');
    } else {
        btn.textContent = "عرض الدورات المعلقة";
        btn.classList.add('btn-glass');
        btn.classList.remove('btn-primary');
    }
}

// 5. المودال
function openAddCourseModal() {
    currentCourseId = null;
    const title = document.getElementById('courseModalTitle');
    const btn = document.getElementById('courseModalSubmitBtn');
    if(title) title.textContent = 'إضافة دورة جديدة';
    if(btn) btn.textContent = 'حفظ الدورة';
    
    if(document.getElementById('courseId')) document.getElementById('courseId').value = ''; 
    document.getElementById('addCourseForm').reset();
    
    const modal = document.getElementById('addCourseModal');
    if(modal) {
        modal.classList.add('active');
        modal.style.visibility = 'visible'; 
        modal.style.opacity = '1';
    }
}

function closeAddCourseModal() {
    const modal = document.getElementById('addCourseModal');
    if(modal) {
        modal.classList.remove('active');
        modal.style.visibility = 'hidden'; 
        modal.style.opacity = '0';
    }
    document.getElementById('addCourseForm').reset();
    currentCourseId = null;
}

// تعديل (جلب بيانات الدورة الحقيقية)
async function editCourse(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('فشل جلب بيانات الدورة');
        
        const course = await response.json();
        
        currentCourseId = course.id;
        document.getElementById('courseName').value = course.name;
        document.getElementById('courseCenterId').value = course.centerId;
        document.getElementById('courseLevel').value = course.level;
        document.getElementById('coursePrice').value = course.price;

        document.getElementById('courseModalTitle').textContent = 'تعديل الدورة';
        document.getElementById('courseModalSubmitBtn').textContent = 'حفظ التعديلات';
        
        const modal = document.getElementById('addCourseModal');
        modal.classList.add('active');
        modal.style.visibility = 'visible'; 
        modal.style.opacity = '1';

    } catch (error) {
        alert("خطأ: " + error.message);
    }
}

// 6. الحفظ (POST/PUT)
const form = document.getElementById('addCourseForm');
if(form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            id: currentCourseId,
            name: document.getElementById('courseName').value,
            centerId: document.getElementById('courseCenterId').value,
            level: document.getElementById('courseLevel').value,
            price: parseFloat(document.getElementById('coursePrice').value),
            // إذا كانت جديدة نجعلها pending، وإذا تعديل نترك الحالة كما هي
            status: currentCourseId ? undefined : 'pending' 
        };

        const url = currentCourseId ? `${API_BASE_URL}/courses/${currentCourseId}` : `${API_BASE_URL}/courses`;
        const method = currentCourseId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('فشل عملية الحفظ');
            
            alert("تم الحفظ بنجاح!");
            closeAddCourseModal();
            renderCourses();

        } catch (error) {
            alert("خطأ: " + error.message);
        }
    });
}

// 7. الحذف (DELETE)
async function deleteCourse(id, name) {
    if (confirm(`هل أنت متأكد من حذف الدورة: ${name}؟`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(response.ok) {
                renderCourses();
            } else {
                alert("فشل الحذف. تحقق من الصلاحيات.");
            }
        } catch (e) {
            console.error(e);
            alert("حدث خطأ أثناء الحذف.");
        }
    }
}
window.openAddCourseModal = openAddCourseModal;
window.closeAddCourseModal = closeAddCourseModal;
window.filterCourses = filterCourses;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;