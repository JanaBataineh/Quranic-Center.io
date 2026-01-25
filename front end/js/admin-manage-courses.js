/* js/admin-manage-courses.js */
const API_URL = "http://localhost:5220/api/admin/courses";
const token = typeof globalToken !== 'undefined' ? globalToken : localStorage.getItem("authToken");
let currentCourseId = null;
let showPendingOnly = false; // 1. متغير لتتبع حالة الفلترة
// دالة لجلب المراكز وتعبئة القائمة المنسدلة
async function loadCentersForSelect() {
    const select = document.getElementById("courseCenterId");
    if(!select) return;

    try {
        // نطلب قائمة المراكز من السيرفر
        const response = await fetch("http://localhost:5220/api/admin/centers", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if(response.ok) {
            const centers = await response.json();
            // تعبئة الخيارات
            select.innerHTML = '<option value="">-- اختر المركز --</option>' + 
                centers.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
        }
    } catch (error) {
        console.error("فشل تحميل المراكز للقائمة", error);
        select.innerHTML = '<option value="">فشل تحميل المراكز</option>';
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadCourses();
    loadCentersForSelect();
});
// ============================================================
// 2. دالة الفلترة (الحل للمشكلة الظاهرة في الصورة)
// ============================================================
window.filterCourses = function() {
    showPendingOnly = !showPendingOnly; // عكس الحالة
    const btn = document.getElementById("filterBtn");
    
    // تغيير شكل ونص الزر
    if(showPendingOnly) {
        btn.textContent = "عرض كل الدورات";
        btn.classList.remove("btn-glass"); // إزالة الستايل الشفاف
        btn.classList.add("btn-primary");  // إضافة لون أزرق
    } else {
        btn.textContent = "عرض الدورات المعلقة";
        btn.classList.add("btn-glass");
        btn.classList.remove("btn-primary");
    }
    
    // إعادة تحميل الجدول بالفلتر الجديد
    loadCourses();
}





// دالة جلب الدورات
async function loadCourses() {
    const tbody = document.getElementById("coursesTableBody");
    if(!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">جاري التحميل...</td></tr>';

    try {
        const response = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("404 - الرابط غير موجود");
        let courses = await response.json();
        // 3. تطبيق الفلترة إذا كان الزر مفعلاً
        if (showPendingOnly) {
            courses = courses.filter(c => c.status === "pending");
        }
        if (courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد دورات متاحة.</td></tr>';
            return;
        }

        tbody.innerHTML = courses.map((course, index) =>{
            const isPublished = course.status === 'published' || course.status === 'approved';
      const statusBadge = isPublished
                ? '<span class="badge badge-status-published">منشور</span>'
                : '<span class="badge" style="background:#f39c12; color:white;">معلق</span>';
            
            // 2. تحديد الزر المناسب (اعتماد أو إلغاء)
            let actionBtn = '';
            
            if (isPublished) {
                // إذا كانت منشورة -> أظهر زر "إلغاء الاعتماد" (لون برتقالي)
                actionBtn = `<button class="btn" style="background-color: #e67e22; border: 1px solid #d35400; margin-left:5px;" onclick="revokeCourse('${course.id}')">إلغاء</button>`;
            } else {
                // إذا كانت معلقة -> أظهر زر "اعتماد" (لون أخضر)
                actionBtn = `<button class="btn" style="background-color: #2ecc71; border: 1px solid #27ae60; margin-left:5px;" onclick="approveCourse('${course.id}')">اعتماد</button>`;
            }
                return `
<tr>
                <td>${index + 1}</td>
                <td style="font-weight:bold;">${course.name}</td>
                <td>${course.centerName}</td>
                <td><span class="badge">${course.level}</span></td>
                <td>${course.price} د.أ</td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                        ${actionBtn} 
                        <button class="btn btn-edit" onclick="editCourse('${course.id}')">تعديل</button>
                        <button class="btn btn-delete" onclick="deleteCourse('${course.id}')">حذف</button>
                    </div>
                </td>
            </tr>
        `}).join("");

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">خطأ في تحميل الدورات (404)</td></tr>';
    }
}










// دالة فتح المودال (للإضافة)
window.openAddCourseModal = function() {
    currentCourseId = null;
    document.getElementById("addCourseForm").reset();
    document.getElementById("courseModalTitle").textContent = "إضافة دورة جديدة";
    document.getElementById("addCourseModal").classList.add("active");
};

window.closeAddCourseModal = function() {
    document.getElementById("addCourseModal").classList.remove("active");
};
// ============================================================
// دالة التعديل (جلب بيانات الدورة وتعبئة المودال)
// ============================================================
window.editCourse = async function(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { // تأكد من وجود دالة GetById في السيرفر لهذا المسار
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const course = await response.json();
            
            currentCourseId = course.id;
            document.getElementById("courseId").value = course.id;
            document.getElementById("courseName").value = course.name;
            document.getElementById("courseCenterId").value = course.centerId; // تأكد أن الموديل يرجع centerId
            document.getElementById("courseLevel").value = course.level;
            document.getElementById("coursePrice").value = course.price;

            document.getElementById("courseModalTitle").textContent = "تعديل الدورة";
            document.getElementById("courseModalSubmitBtn").textContent = "حفظ التعديلات";
            
            const modal = document.getElementById("addCourseModal");
            modal.classList.add("active");
        } else {
            alert("فشل جلب بيانات الدورة للتعديل");
        }
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الاتصال");
    }
}

// ============================================================
// دالة الحذف
// ============================================================
window.deleteCourse = async function(id) {
    if(confirm("هل أنت متأكد من حذف هذه الدورة؟")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if(response.ok) {
                alert("تم الحذف بنجاح");
                loadCourses(); // تحديث الجدول
            } else {
                alert("فشل الحذف");
            }
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الحذف");
        }
    }
}

// ============================================================
// معالجة تقديم النموذج (للحفظ والتعديل)
// ============================================================
const form = document.getElementById("addCourseForm");
if(form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            name: document.getElementById("courseName").value,
            centerId: document.getElementById("courseCenterId").value,
            level: document.getElementById("courseLevel").value,
            price: parseFloat(document.getElementById("coursePrice").value),
            // إذا كان تعديل، نحافظ على الحالة القديمة، إذا جديد تكون pending
            // يمكنك تعديل هذا المنطق حسب الحاجة
        };

        const id = currentCourseId;
        const url = id ? `${API_URL}/${id}` : API_URL; // نحتاج دالة PUT في السيرفر
        const method = id ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("تم الحفظ بنجاح");
                closeAddCourseModal();
                loadCourses();
            } else {
                alert("حدث خطأ أثناء الحفظ");
            }
        } catch (error) {
            console.error(error);
            alert("خطأ في الاتصال");
        }
    });
}
// ============================================================
// دالة اعتماد الدورة (جديدة)
// ============================================================
window.approveCourse = async function(id) {
    if(confirm("هل أنت متأكد من اعتماد هذه الدورة ونشرها؟")) {
        try {
            // استدعاء الـ API الجديد الذي أنشأناه
            const response = await fetch(`${API_URL}/${id}/approve`, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });

            if(response.ok) {
                alert("تم اعتماد الدورة بنجاح!");
                loadCourses(); // تحديث الجدول لإظهار الحالة الجديدة
            } else {
                alert("فشل عملية الاعتماد");
            }
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الاتصال");
        }
    }
}
// ============================================================
// دالة إلغاء الاعتماد (جديدة)
// ============================================================
window.revokeCourse = async function(id) {
    if(confirm("هل تريد إلغاء اعتماد هذه الدورة وإعادتها للمراجعة؟")) {
        try {
            const response = await fetch(`${API_URL}/${id}/revoke`, { // لاحظي الرابط revoke
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if(response.ok) {
                alert("تم إلغاء الاعتماد");
                loadCourses(); // تحديث الجدول
            } else {
                alert("فشل العملية");
            }
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الاتصال");
        }
    }
}