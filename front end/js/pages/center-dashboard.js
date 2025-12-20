    // ******************************************************
    // 1. الإعدادات العامة والمتغيرات
    // ******************************************************
    
    // 🌟 جديد: تعريف رابط API خاص بالمراكز
const CENTER_API_URL = CONFIG.getUrl(CONFIG.ENDPOINTS.CENTER);
    const token = localStorage.getItem('authToken');
    let currentCenterId = null; // سيتم جلبه من الـ API

    // ******************************************************
    // 2. دوال التفعيل والتحميل الرئيسية
    // ******************************************************

    document.addEventListener('DOMContentLoaded', () => {
        // (1) ربط أحداث تبديل الأقسام
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.main-content-area section').forEach(sec => sec.classList.add('hidden'));
                
                this.classList.add('active');
                document.getElementById(targetId).classList.remove('hidden');
            });
        });
        
        // (2) 🌟 جديد: تحميل بيانات المركز (ومن ثم دوراته)
        loadCenterData();

        // (3) 🌟 جديد: ربط نموذج إضافة دورة
        document.getElementById('addCourseForm').addEventListener('submit', handleCourseSubmit);
    });

    /**
     * 🌟 جديد: دالة لجلب بيانات المركز المسجل (ID والاسم)
     * GET: /api/Center/my-info
     */
// ... (داخل ملف dashbordcenters.html) ...

    async function loadCenterData() {
        if (!token) {
            alert("جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.");
            logout();
            return;
        }

        // 🌟 جديد: جلب الإيميل الذي تم تخزينه عند تسجيل الدخول
        const userEmail = localStorage.getItem('currentStudentEmail');
        if (!userEmail) {
            alert("خطأ في الجلسة. لم يتم العثور على إيميل المستخدم.");
            logout();
            return;
        }

        try {
            const response = await fetch(`${CENTER_API_URL}/my-info`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    // 🌟 إرسال الإيميل هنا
                    'User-Email': userEmail 
                }
            });

            if (!response.ok) {
                throw new Error('فشل جلب بيانات المركز. يرجى تسجيل الدخول مرة أخرى.');
            }
            
            const center = await response.json();
            
            // (باقي الكود كما هو)
            currentCenterId = center.id; 
            document.getElementById('centerNameHeader').textContent = center.name;
            document.getElementById('centerName').value = center.name; 
            await loadCenterCourses(currentCenterId);

        } catch (error) {
            console.error(error);
            document.getElementById('coursesList').innerHTML = `<li>خطأ: ${error.message}</li>`;
        }
    }
    // ... (باقي دوال الجافاسكربت كما هي) ...

    // ******************************************************
    // 3. دوال إدارة الدورات (الخاصة بالمركز)
    // ******************************************************

    /**
     * 🌟 جديد: جلب الدورات الخاصة بهذا المركز فقط
     * GET: /api/Center/courses/{centerId}
     */
    async function loadCenterCourses(centerId) {
        const list = document.getElementById('coursesList');
        list.innerHTML = '<li>جاري تحميل الدورات...</li>';
        
        try {
            // (ملاحظة: ستحتاج لإنشاء نقطة النهاية هذه)
            const response = await fetch(`${CENTER_API_URL}/courses/${centerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('فشل جلب الدورات.');
            
            const courses = await response.json();
            
            if (courses.length === 0) {
                list.innerHTML = '<li>لم تقم بإضافة أي دورات بعد.</li>';
                return;
            }
            
            list.innerHTML = courses.map(course => `
                <li>
                    <span>
                        <strong>${course.name}</strong> (${course.level}) - ${course.price} د.أ 
                        <span class="badge badge-${course.status === 'approved' ? 'success' : 'warning'}">
                            ${course.status === 'approved' ? 'معتمد' : 'بانتظار الموافقة'}
                        </span>
                    </span>
                    <button class="delete-btn" onclick="deleteCourse('${course.id}')">حذف</button>
                </li>
            `).join('');

        } catch (error) {
            console.error(error);
            list.innerHTML = `<li>خطأ في تحميل الدورات.</li>`;
        }
    }

    /**
     * 🌟 جديد: معالج إرسال نموذج إضافة دورة
     * POST: /api/Center/courses
     */
    async function handleCourseSubmit(e) {
        e.preventDefault();
        if (!currentCenterId) {
            alert('خطأ: لم يتم تحديد معرّف المركز.');
            return;
        }

        const courseData = {
            name: document.getElementById('courseName').value,
            level: document.getElementById('courseLevel').value,
            price: parseFloat(document.getElementById('coursePrice').value),
            centerId: currentCenterId // إرسال ID المركز تلقائياً
        };

        try {
            // (ملاحظة: ستحتاج لإنشاء نقطة النهاية هذه)
            const response = await fetch(`${CENTER_API_URL}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(courseData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'فشل إضافة الدورة.');
            }

            alert('تمت إضافة الدورة بنجاح. ستكون "معلقة" حتى يوافق عليها الأدمن.');
            document.getElementById('addCourseForm').reset();
            await loadCenterCourses(currentCenterId); // تحديث القائمة

        } catch (error) {
            alert(`خطأ: ${error.message}`);
        }
    }

    /**
     * 🌟 جديد: حذف دورة
     * DELETE: /api/Center/courses/{id}
     */
    async function deleteCourse(courseId) {
        if (!confirm('هل أنت متأكد من حذف هذه الدورة؟')) return;

        try {
            // (ملاحظة: ستحتاج لإنشاء نقطة النهاية هذه)
            const response = await fetch(`${CENTER_API_URL}/courses/${courseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('فشل الحذف. قد تكون الدورة غير موجودة أو لا تملك الصلاحية.');
            
            alert('تم حذف الدورة.');
            await loadCenterCourses(currentCenterId); // تحديث القائمة

        } catch (error) {
            alert(`خطأ: ${error.message}`);
        }
    }

    /**
     * دالة تسجيل الخروج (موجودة)
     */
    function logout() {
        // (يجب حذف التوكن الخاص بالمركز)
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUserType');
        window.location.href = 'login.html';
    }