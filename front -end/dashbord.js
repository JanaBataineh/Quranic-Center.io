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