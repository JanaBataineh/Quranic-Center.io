/* js/admin-manage-centers.js */

// 1. إعداد الرابط والتوكن
const API_URL = "http://localhost:5220/api/admin/centers";
const token = typeof globalToken !== 'undefined' ? globalToken : localStorage.getItem("authToken");
let currentCenterId = null;
let showPendingOnly = false; // ✅ تصحيح 1: تعريف متغير الفلترة

// 2. تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadCenters();
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAddCenterModal();
    });
});

// ============================================================
// 3. دالة الفلترة (زر عرض المراكز المعلقة)
// ============================================================
window.filterCenters = function() {
    showPendingOnly = !showPendingOnly; // عكس الحالة
    const btn = document.getElementById("filterBtn");
    
    if(showPendingOnly) {
        btn.textContent = "عرض كل المراكز";
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
    } else {
        btn.textContent = "عرض المراكز المعلقة";
        btn.classList.add("btn-secondary");
        btn.classList.remove("btn-primary");
    }
    loadCenters(); // إعادة تحميل الجدول
}

// ============================================================
// 4. دالة جلب المراكز للجدول
// ============================================================
async function loadCenters() {
    const tbody = document.getElementById("centersTableBody");
    if(!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">جاري التحميل...</td></tr>';

    try {
        const response = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("فشل الاتصال");

        let centers = await response.json(); // ✅ نستخدم let لأننا سنعدل المصفوفة

        // ✅ تصحيح 2: تطبيق الفلترة الفعلي على البيانات
        if (showPendingOnly) {
            centers = centers.filter(c => c.status !== 'approved' && c.status !== 'published');
        }

        if (!centers || centers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد مراكز.</td></tr>';
            return;
        }

        tbody.innerHTML = centers.map((center, index) => {
            // منطق التحقق من الحالة
            const isApproved = center.status === 'approved' || center.status === 'published';

            // تحديد لون الشارة
            const statusBadge = isApproved
                ? '<span class="badge badge-status-published">معتمد</span>'
                : '<span class="badge" style="background:#f39c12; color:white;">معلق</span>';

            // تحديد الزر المناسب (اعتماد أو إلغاء)
            let actionBtn = '';
            
            if (isApproved) {
                // إذا كان معتمد -> أظهر زر إلغاء (برتقالي)
                actionBtn = `<button class="btn" style="background-color: #e67e22; border: 1px solid #d35400; margin-left:5px;" onclick="revokeCenter('${center.id}')">إلغاء</button>`;
            } else {
                // إذا كان معلق -> أظهر زر اعتماد (أخضر)
                actionBtn = `<button class="btn" style="background-color: #2ecc71; border: 1px solid #27ae60; margin-left:5px;" onclick="approveCenter('${center.id}')">اعتماد</button>`;
            }

            return `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight:bold;">${center.name}</td>
                <td>${center.city || '-'}</td>
                <td>${statusBadge}</td>
                <td>${center.createdAt ? new Date(center.createdAt).toLocaleDateString('ar-JO') : '-'}</td>
                <td>
                    ${actionBtn} 
                    <button class="btn btn-edit" onclick="editCenter('${center.id}')">تعديل</button>
                    <button class="btn btn-delete" onclick="deleteCenter('${center.id}')">حذف</button>
                </td>
            </tr>
            `;
        }).join("");

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">خطأ في تحميل البيانات</td></tr>';
    }
}

// ============================================================
// 5. دالة فتح المودال
// ============================================================
window.openAddCenterModal = function() {
    currentCenterId = null;
    const title = document.getElementById("centerModalTitle");
    if(title) title.textContent = "إضافة مركز جديد";
    
    const form = document.getElementById("addCenterForm");
    if(form) form.reset();
    
    const idField = document.getElementById("centerId");
    if(idField) idField.value = ""; 
    
    const modal = document.getElementById("addCenterModal"); 
    if(modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    }
}

window.closeAddCenterModal = function() {
    const modal = document.getElementById("addCenterModal");
    if(modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
    currentCenterId = null;
}

// ============================================================
// 6. دالة الحفظ
// ============================================================
const form = document.getElementById("addCenterForm");
if(form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            name: document.getElementById('centerName').value,
            city: document.getElementById('centerCity').value,
            address: document.getElementById('centerAddress').value,
            phone: document.getElementById('centerPhone').value,
            email: document.getElementById('centerEmail').value,
            password: document.getElementById('centerPassword').value,
            classification: document.getElementById('centerClassification')?.value || "مشترك",
            managerName: document.getElementById('centerManager')?.value || "",
            district: document.getElementById('centerDistrict')?.value || "",
            area: document.getElementById('centerArea')?.value || "",
            neighborhood: document.getElementById('centerNeighborhood')?.value || "",
            streetName: document.getElementById('centerStreet')?.value || "",
            nearestLandmark: document.getElementById('centerLandmark')?.value || "",
            buildingNumber: document.getElementById('centerBuildingNo')?.value || "",
            floor: document.getElementById('centerFloor')?.value || "",
            workingHours: document.getElementById('centerHours')?.value || "",
            established: new Date().getFullYear()
        };

        const id = currentCenterId || document.getElementById('centerId').value;
        const url = id ? `${API_URL}/${id}` : API_URL;
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
                alert(id ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح");
                closeAddCenterModal();
                loadCenters();
            } else {
                const err = await response.json();
                alert("حدث خطأ: " + (err.message || "فشل العملية"));
            }
        } catch (error) {
            console.error(error);
            alert("خطأ في الاتصال");
        }
    });
}

// ============================================================
// 7. دالة التعديل
// ============================================================
window.editCenter = async function(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const center = await response.json();
            
            currentCenterId = center.id;
            const idField = document.getElementById('centerId');
            if(idField) idField.value = center.id;

            const fieldsMap = {
                'centerName': center.name,
                'centerCity': center.city,
                'centerClassification': center.classification,
                'centerManager': center.managerName,
                'centerDistrict': center.district,
                'centerNeighborhood': center.neighborhood,
                'centerStreet': center.streetName,
                'centerLandmark': center.nearestLandmark,
                'centerBuildingNo': center.buildingNumber,
                'centerFloor': center.floor,
                'centerHours': center.workingHours,
                'centerPhone': center.phone,
                'centerEmail': center.email,
                'centerAddress': center.address
            };

            for (const [elementId, value] of Object.entries(fieldsMap)) {
                const element = document.getElementById(elementId);
                if (element) element.value = value || "";
            }

            const title = document.getElementById("centerModalTitle");
            if(title) title.textContent = "تعديل بيانات المركز";
            
            const submitBtn = document.getElementById("centerModalSubmitBtn");
            if(submitBtn) submitBtn.textContent = "تحديث البيانات";

            const modal = document.getElementById("addCenterModal");
            if(modal) {
                modal.classList.add("active");
                modal.style.display = "flex";
            }
        } else {
            alert("حدث خطأ أثناء جلب بيانات المركز.");
        }
    } catch (error) {
        console.error(error);
        alert("تعذر الاتصال بالسيرفر.");
    }
}

// ============================================================
// 8. دالة الحذف
// ============================================================
window.deleteCenter = async function(id) {
    if(confirm("هل أنت متأكد من الحذف؟")) {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) loadCenters();
            else alert("فشل الحذف");
        } catch(e) { console.error(e); }
    }
}

// ============================================================
// 9. دالة اعتماد المركز
// ============================================================
window.approveCenter = async function(id) {
    if(confirm("هل أنت متأكد من اعتماد هذا المركز؟")) {
        try {
            const response = await fetch(`${API_URL}/${id}/approve`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if(response.ok) {
                alert("تم اعتماد المركز بنجاح!");
                loadCenters(); 
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
// 10. دالة إلغاء اعتماد المركز
// ============================================================
window.revokeCenter = async function(id) {
    if(confirm("هل تريد إلغاء اعتماد المركز وإعادته للمراجعة؟")) {
        try {
            const response = await fetch(`${API_URL}/${id}/revoke`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if(response.ok) {
                alert("تم إلغاء الاعتماد");
                loadCenters(); 
            } else {
                alert("فشل العملية");
            }
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الاتصال");
        }
    }
}