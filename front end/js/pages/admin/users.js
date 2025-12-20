/* =========================================
   Admin Users Logic (إدارة المستخدمين - API ONLY)
   ========================================= */

const API_BASE_URL = CONFIG.getUrl(CONFIG.ENDPOINTS.ADMIN);
const token = localStorage.getItem('authToken');

// 1. التهيئة
document.addEventListener('DOMContentLoaded', () => {
    renderUsers();
});

// 2. جلب البيانات
async function getUsersFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("فشل في الاتصال");
        return await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

// 3. عرض الجدول
async function renderUsers(searchQuery = '') {
    const tbody = document.getElementById('usersTableBody');
    if(!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">جاري التحميل...</td></tr>';

    try {
        let usersData = await getUsersFromAPI();

        // تصفية محلية إذا وجد بحث (أو يمكنك عمل البحث في السيرفر)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            usersData = usersData.filter(user => 
                (user.firstName + ' ' + user.lastName).toLowerCase().includes(lowerQuery) || 
                user.email.toLowerCase().includes(lowerQuery)
            );
        }

        if(usersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">لا توجد بيانات</td></tr>';
            return;
        }

        tbody.innerHTML = usersData.map((user, index) => {
            let roleClass = user.userType === 'Admin' ? 'bg-danger' : (user.userType === 'Center' ? 'bg-success' : 'bg-info');
            let roleText = user.userType === 'Admin' ? 'مسؤول' : (user.userType === 'Center' ? 'مركز' : 'طالب');
            
            // افتراض حالة افتراضية إذا لم تكن موجودة
            let status = user.isActive ? 'active' : 'banned'; 
            let statusClass = status === 'active' ? 'bg-success' : 'bg-danger';
            let statusText = status === 'active' ? 'نشط' : 'محظور';

            return `
                <tr>
                    <td style="color:#666;">${index + 1}</td>
                    <td style="color:white; font-weight:bold;">${user.firstName} ${user.lastName}</td>
                    <td>${user.email}</td>
                    <td><span class="badge ${roleClass}">${roleText}</span></td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">حذف</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">حدث خطأ!</td></tr>';
    }
}

// 4. حذف مستخدم
async function deleteUser(id) {
    if(confirm('هل أنت متأكد من الحذف؟')) {
        try {
            const res = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                renderUsers();
            } else {
                alert("فشل الحذف");
            }
        } catch(e) { console.error(e); }
    }
}

// 5. البحث
function searchUsers(query) {
    renderUsers(query);
}

// 1. تعديل دالة فتح المودال لإظهار النافذة بدلاً من التنبيه
function openAddUserModal() {
    // تصفير الحقول قبل الفتح
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPassword').value = ''; // حقل جديد
    document.getElementById('userRole').value = 'Student';
    
    document.getElementById('modalTitle').innerText = "إضافة مستخدم جديد";
    
    // إظهار المودال (تأكد أن CSS يدعم display: flex عند التفعيل)
    const modal = document.getElementById('userModal');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
}

// 2. دالة إغلاق المودال
function closeModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
}
// 3. دالة الحفظ (إرسال البيانات للسيرفر)
async function saveUser(event) {
    event.preventDefault(); // منع تحديث الصفحة

    const nameParts = document.getElementById('userName').value.split(' ');
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "New";

    const userData = {
        firstName: firstName,
        middleName: "-",      // قيمة افتراضية
        lastName: lastName,
        age: 20,              // قيمة افتراضية
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        userType: document.getElementById('userRole').value // Student, Center, Admin
    };

    try {
        // نستخدم Auth/register لإنشاء الحساب
        const response = await fetch(`${CONFIG.getUrl(CONFIG.ENDPOINTS.AUTH)}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // في حال أردت حماية التسجيل مستقبلاً
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert("تم إضافة المستخدم بنجاح!");
            closeModal();
            renderUsers(); // تحديث الجدول
        } else {
            const errorData = await response.json();
            alert("فشل الإضافة: " + (errorData.message || "تأكد من البيانات"));
        }
    } catch (error) {
        console.error(error);
        alert("حدث خطأ في الاتصال بالسيرفر");
    }
}

window.renderUsers = renderUsers;
window.searchUsers = searchUsers;
window.deleteUser = deleteUser;
window.openAddUserModal = openAddUserModal;
window.closeModal = closeModal;
window.saveUser = saveUser;
