// يجب استبدال هذا بربط API فعلي لجلب الإحصائيات من Node.js
async function loadAdminStatistics() {
  // const response = await fetch('/api/admin/stats');
  // const stats = await response.json();

  // محاكاة البيانات
  const stats = {
      totalCenters: 15, // الرقم الحقيقي من MongoDB
      totalCourses: 45,
      totalUsers: 150,
      pendingCenters: 5,
      pendingCourses: 8,
      newMessages: 12
  };

  document.getElementById('centersCount').textContent = stats.totalCenters;
  document.getElementById('coursesCount').textContent = stats.totalCourses;
  document.getElementById('usersCount').textContent = stats.totalUsers;
  // ... تحديث باقي الإحصائيات

  // تحديث الإجراءات المطلوبة
  document.getElementById('pendingCentersCount').textContent = stats.pendingCenters;
  document.getElementById('pendingCoursesCount').textContent = stats.pendingCourses;
  document.getElementById('newMessagesCount').textContent = stats.newMessages;
}
// داخل dashbord.js

// 💡 تأكد أن هذا العنوان يتطابق مع المنفذ الذي يعمل عليه الخادم الآن
const API_BASE_URL = 'http://localhost:5220/api'; 

async function loadAdminStatistics() {
  try {
    // ⚠️ في بيئة حقيقية: يجب استبدال التوكن بالتوكن الحقيقي المخزن في LocalStorage بعد الدخول
    const token = localStorage.getItem('authToken') || 'mock-token-for-admin-stats'; 
      
    const response = await fetch(`${API_BASE_URL}/Admin/stats`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // لإرسال رمز المصادقة (JWT)
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        console.error('فشل جلب الإحصائيات:', response.statusText);
        // يمكن هنا عرض رسالة خطأ للمسؤول
        return;
    }

    const stats = await response.json(); 
    
    // تحديث بطاقات الإحصائيات العامة
    document.getElementById('centersCount').textContent = stats.totalCenters;
    document.getElementById('coursesCount').textContent = stats.totalCourses;
    document.getElementById('usersCount').textContent = stats.totalUsers;
    // ملاحظة: يجب إضافة تحديث لـ 'citiesCount' إذا توفر في الإحصائيات

    // تحديث بطاقات الإجراءات المطلوبة
    document.getElementById('pendingCentersCount').textContent = stats.pendingCenters;
    document.getElementById('pendingCoursesCount').textContent = stats.pendingCourses;
    document.getElementById('newMessagesCount').textContent = stats.newMessages;

  } catch (error) {
    console.error("خطأ في الاتصال بالـ API لجلب الإحصائيات:", error);
  }
}

document.addEventListener('DOMContentLoaded', loadAdminStatistics);