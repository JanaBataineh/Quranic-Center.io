/* js/manage-users-logic.js */

// تأكد من أن CONFIG معرف في ملف config.js الذي يتم تحميله قبله
const API_URL = "http://localhost:5220/api"; 
let allUsers = []; // لتخزين المستخدمين للبحث والفلترة محلياً

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    
    // تفعيل الفلترة عند تغيير القائمة
    const filterSelect = document.getElementById('filterUserRole');
    if(filterSelect) {
        filterSelect.addEventListener('change', filterUsers);
    }
});

// 1. جلب المستخدمين وعرضهم
async function loadUsers() {
    const token = localStorage.getItem('authToken');
    const tbody = document.getElementById('usersTableBody');
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">جاري التحميل...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/Admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            allUsers = await response.json();
            renderUsers(allUsers);
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">فشل تحميل البيانات</td></tr>';
        }
    } catch (error) {
        console.error("Error:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">خطأ في الاتصال</td></tr>';
    }
}

// 2. رسم الجدول
function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد بيانات</td></tr>';
        return;
    }

    users.forEach((user, index) => {
        // تحديد لون الصلاحية
        let roleBadge = '';
        if (user.userType === 'Admin'||user.userType==='admin') roleBadge = '<span class="badge bg-danger">مسؤول</span>';
        else if (user.userType === 'Teacher'||user.userType==='teacher'||user.userType==='Teachers'||user.userType==='teachers') roleBadge = '<span class="badge bg-warning">معلم</span>';
        else if (user.userType === 'Center' || user.userType === 'center'|| user.userType === 'Centers'|| user.userType === 'centers') roleBadge = '<span class="badge bg-info">مركز</span>';
        else roleBadge = '<span class="badge bg-success">طالب</span>';

        // تحديد الحالة



        
        const statusBadge = user.isActive 
            ? '<span class="badge bg-success">نشط</span>' 
            : '<span class="badge bg-danger">محظور</span>';

        const tr = `
            <tr>
                <td>${index + 1}</td>
                <td style="color: white; font-weight: bold;">${user.fullName || user.firstName + ' ' + user.lastName}</td>
                <td>${user.email}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}

// 3. ✅ دالة البحث
function searchUsers(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = allUsers.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(lowerQuery)) ||
        (u.firstName && u.firstName.toLowerCase().includes(lowerQuery)) ||
        (u.email && u.email.toLowerCase().includes(lowerQuery))
    );
    renderUsers(filtered);
}

// 4. ✅ دالة الفلترة (تستخدم ID الفلتر الجديد)
function filterUsers() {
    const role = document.getElementById('filterUserRole').value.toLowerCase();
    
    if (role === "") {
        renderUsers(allUsers); // عرض الكل
    } else {
        const filtered = allUsers.filter(u => u.userType.toLowerCase() === role);
        renderUsers(filtered);
    }
}

// 5. ✅ دالة حفظ المستخدم الجديد (تستخدم ID المودل الجديد)
// 5. دالة حفظ المستخدم الجديد (معدلة)
async function saveUser(event) {
    event.preventDefault();
    
    // جلب القيم من الحقول الثلاثة الجديدة
    const firstName = document.getElementById('firstName').value;
    const middleName = document.getElementById('middleName').value;
    const lastName = document.getElementById('lastName').value;
    
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    
    // التأكد من جلب الصلاحية الصحيحة
    const roleElement = document.getElementById('registerUserRole');
    const role = roleElement ? roleElement.value : 'Student';

    // تجهيز البيانات كما يطلبها الباك اند (UserRegistrationDto)
    const payload = {
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        email: email,
        password: password,
        userType: role,
        age: 20, // قيمة افتراضية
        phoneNumber: "0000000000" // قيمة افتراضية
    };

    try {
        // نستخدم التوكن للأمان
        const token = localStorage.getItem('authToken');
        
        // إرسال الطلب لرابط إنشاء المستخدم في الأدمن
        // ملاحظة: غيرت الرابط لـ Admin/users/create لأنه الأصح للإضافة من لوحة التحكم
        const response = await fetch(`${API_URL}/Admin/users/create`, { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ تم إضافة المستخدم بنجاح!");
            closeModal();
            loadUsers(); // تحديث الجدول
        } else {
            // عرض رسالة الخطأ
            let msg = result.message || "فشل الإضافة";
            if(result.errors) msg += "\n" + JSON.stringify(result.errors);
            alert("❌ خطأ: " + msg);
        }
    } catch (error) {
        console.error(error);
        alert("حدث خطأ في الاتصال");
    }
}

// 6. حذف المستخدم
async function deleteUser(id) {
    if(!confirm("هل أنت متأكد من الحذف؟")) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/Admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadUsers(); // تحديث الجدول
        } else {
            alert("فشل الحذف");
        }
    } catch (error) {
        console.error(error);
    }
}

// دوال المودل (فتح وإغلاق)
window.openAddUserModal = function() {
    // 1. تصفير الحقول (كما هي)
    if(document.getElementById('userId')) document.getElementById('userId').value = '';
    if(document.getElementById('firstName')) document.getElementById('firstName').value = '';
    if(document.getElementById('middleName')) document.getElementById('middleName').value = '';
    if(document.getElementById('lastName')) document.getElementById('lastName').value = '';
    if(document.getElementById('userEmail')) document.getElementById('userEmail').value = '';
    if(document.getElementById('userPassword')) document.getElementById('userPassword').value = '';

    // 2. إجبار النافذة على الظهور (تجاوز أي مشاكل CSS)
    const modal = document.getElementById('userModal');
    
    if(modal) {
        // فرض الخصائص مباشرة على العنصر لضمان ظهوره
        modal.style.display = 'flex';
        modal.style.zIndex = '999999';   /* رقم فلكي لتظهر فوق كل شيء */
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'; /* خلفية داكنة واضحة */
        modal.style.pointerEvents = 'auto';
        
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';     /* عرض الشاشة كاملة */
        modal.style.height = '100vh';    /* طول الشاشة كاملة */
        
        console.log("تم إجبار النافذة على الظهور!");
    } else {
        alert("خطأ: لم يتم العثور على النافذة (userModal) في الصفحة!");
    }
}

window.closeModal = function() {
    document.getElementById('userModal').style.display = 'none';
}

// إغلاق المودل عند النقر خارجه
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// ربط الدوال بالنافذة (Global Scope) لتعمل مع HTML onclick
window.saveUser = saveUser;
window.searchUsers = searchUsers;
window.deleteUser = deleteUser;