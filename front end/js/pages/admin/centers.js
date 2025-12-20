/* =========================================
   Admin Centers Logic (إدارة المراكز - API ONLY)
   ========================================= */

const API_BASE_URL = CONFIG.getUrl(CONFIG.ENDPOINTS.ADMIN);
const token = localStorage.getItem('authToken');
let isPendingFilterActive = false;
let currentCenterId = null;

// التحقق من فلتر الرابط
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('status') === 'pending') {
    isPendingFilterActive = true;
}

document.addEventListener('DOMContentLoaded', () => {
    renderCenters();
    updateFilterButtonText();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAddCenterModal();
    });
});

// جلب البيانات
async function getCentersFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/centers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("فشل الاتصال بالسيرفر");
        return await response.json();
    } catch (error) {
        console.error("Error fetching centers:", error);
        return [];
    }
}

// عرض الجدول
async function renderCenters() {
    const tableBody = document.getElementById('centersTableBody');
    if(!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#888;">جاري تحميل البيانات...</td></tr>';

    try {
        let allCenters = await getCentersFromAPI(); 

        if (isPendingFilterActive) {
            allCenters = allCenters.filter(c => c.status !== 'approved' && c.status !== 'published');
        }

        if (!allCenters || allCenters.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">لا توجد مراكز.</td></tr>';
            return;
        }

        const rowsHtml = allCenters.map((center, index) => {
            const statusBadge = (center.status === 'published' || center.status === 'approved') 
                ? '<span class="badge bg-success-dark">معتمد</span>' 
                : '<span class="badge bg-warning-dark">معلق</span>';
            
            return `
                <tr>
                    <td>${index + 1}</td> 
                    <td>${center.name}</td>
                    <td>${center.city || '-'}</td>
                    <td>${statusBadge}</td>
                    <td>${new Date().toLocaleDateString('ar-JO')}</td>
                    <td>
                        <button class="action-btn btn-edit" onclick="editCenter('${center.id}')">تعديل</button>
                        <button class="action-btn btn-delete" onclick="deleteCenter('${center.id}')">حذف</button>
                        ${center.status !== 'approved' ? `<button class="action-btn" style="background:#052c18; color:#2ecc71;" onclick="approveCenter('${center.id}')">اعتماد</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rowsHtml;

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">حدث خطأ في الاتصال!</td></tr>';
    }
}

// باقي دوال المودال والحذف (نفس المنطق - بدون بيانات وهمية)
function openAddCenterModal() {
    currentCenterId = null;
    document.getElementById('centerModalTitle').textContent = "إضافة مركز جديد";
    document.getElementById('addCenterForm').reset();
    const modal = document.getElementById('addCenterModal');
    modal.classList.add('active');
    modal.style.visibility = 'visible'; 
    modal.style.opacity = '1';
}

function closeAddCenterModal() {
    const modal = document.getElementById('addCenterModal');
    modal.classList.remove('active');
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    document.getElementById('addCenterForm').reset();
    currentCenterId = null;
}

// تعديل
async function editCenter(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/centers/${id}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        if(!response.ok) throw new Error("فشل جلب المركز");
        const center = await response.json();

        currentCenterId = center.id;
        document.getElementById('centerName').value = center.name;
        document.getElementById('centerCity').value = center.city;
        document.getElementById('centerAddress').value = center.address;
        document.getElementById('centerPhone').value = center.phone;
        document.getElementById('centerEmail').value = center.email;

        document.getElementById('centerModalTitle').textContent = "تعديل بيانات المركز";
        const modal = document.getElementById('addCenterModal');
        modal.classList.add('active');
        modal.style.visibility = 'visible'; 
        modal.style.opacity = '1';
    } catch(e) { alert(e.message); }
}

// حذف
async function deleteCenter(id) {
    if(!confirm("حذف نهائي؟")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/centers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) renderCenters();
        else alert("فشل الحذف");
    } catch(err) { console.error(err); }
}

// اعتماد
async function approveCenter(id) {
    if(!confirm("اعتماد المركز؟")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/centers/approve/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) renderCenters();
    } catch(err) { console.error(err); }
}

document.getElementById('addCenterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        id: currentCenterId,
        name: document.getElementById('centerName').value,
        city: document.getElementById('centerCity').value,
        address: document.getElementById('centerAddress').value,
        phone: document.getElementById('centerPhone').value,
        email: document.getElementById('centerEmail').value
    };

    const url = currentCenterId ? `${API_BASE_URL}/centers/${currentCenterId}` : `${API_BASE_URL}/centers`;
    const method = currentCenterId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        
        if(res.ok) {
            alert("تم الحفظ بنجاح");
            closeAddCenterModal();
            renderCenters();
        } else {
            alert("حدث خطأ");
        }
    } catch(err) { console.error(err); }
});

function filterCenters() {
    isPendingFilterActive = !isPendingFilterActive;
    updateFilterButtonText();
    renderCenters();
}

function updateFilterButtonText() {
    const btn = document.getElementById('filterBtn');
    if(!btn) return;
    if (isPendingFilterActive) {
        btn.textContent = "عرض كل المراكز";
    } else {
        btn.textContent = "عرض المراكز المعلقة";
    }
}
window.openAddCenterModal = openAddCenterModal;
window.closeAddCenterModal = closeAddCenterModal;
window.editCenter = editCenter;
window.deleteCenter = deleteCenter;
window.approveCenter = approveCenter;
window.filterCenters = filterCenters;