/* js/pages/center-dashboard.js */

// ******************************************************
// 1. الإعدادات العامة والمتغيرات
// ******************************************************

// التحقق: هل CONFIG موجود؟ إذا نعم نستخدمه، إذا لا نستخدم الرابط المحلي المباشر
const CENTER_API_URL = typeof CONFIG !== 'undefined' 
    ? CONFIG.getUrl(CONFIG.ENDPOINTS.CENTER) 
    : "http://localhost:5220/api/Center";

const token = localStorage.getItem('authToken');
let currentCenterId = null; // سيتم تعبئته لاحقاً عند تحميل بيانات المركز



document.addEventListener('DOMContentLoaded', () => {
const isDashboardPage = document.getElementById('teacherSearchInput') || document.getElementById('addCourseForm');
    
    if (!isDashboardPage) {
        return; // ⛔ توقف! نحن لسنا في لوحة التحكم
    }

    const token = localStorage.getItem('authToken');

    // (أ) التبويبات والدورات
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.main-content-area section').forEach(sec => sec.classList.add('hidden'));
            this.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if(targetSection) targetSection.classList.remove('hidden');
        });
    });
    
    // تحميل البيانات
    if(typeof loadCenterData === 'function') loadCenterData();

    // ربط نموذج الدورة
    const courseForm = document.getElementById('addCourseForm');
    if(courseForm && typeof handleCourseSubmit === 'function') {
        courseForm.addEventListener('submit', handleCourseSubmit);
    }

    // (ب) البحث عن المعلمين
    const searchInput = document.getElementById('teacherSearchInput');
    const resultsBox = document.getElementById('searchResults');
    
    if (searchInput) {
        searchInput.addEventListener('input', async function () {
            const query = this.value.trim();
            if (query.length < 2) {
                if(resultsBox) resultsBox.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`${CENTER_API_URL}/CenterStaff/search?query=${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const teachers = await response.json();
                    if(resultsBox) {
                        resultsBox.innerHTML = '';
                        if (teachers.length > 0) {
                            teachers.forEach(t => {
                                const item = document.createElement('button');
                                item.className = 'list-group-item list-group-item-action bg-dark text-white border-secondary';
                                item.style.cursor = 'pointer';
                                item.innerHTML = `
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="fw-bold">${t.fullName}</span>
                                        <small class="text-white-50">${t.email}</small>
                                    </div>`;
                                item.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    selectTeacher(t.id, t.fullName); // استدعاء الدالة الخارجية
                                });
                                resultsBox.appendChild(item);
                            });
                            resultsBox.style.display = 'block';
                        } else {
                            resultsBox.innerHTML = '<div class="list-group-item bg-dark text-white-50">لا توجد نتائج</div>';
                            resultsBox.style.display = 'block';
                        }
                    }
                }
            } catch (error) {
                console.error("خطأ في البحث:", error);
            }
        });

        document.addEventListener('click', function(e) {
            if (searchInput && !searchInput.contains(e.target) && resultsBox && !resultsBox.contains(e.target)) {
                resultsBox.style.display = 'none';
            }
        });
    }

    // (ج) ربط زر الإضافة الجديد (هام جداً)
    const btnConfirmAdd = document.getElementById('btnConfirmAddTeacher');
    if (btnConfirmAdd) {
        btnConfirmAdd.addEventListener('click', submitAddTeacher);
    }
}); 
// ******************************************************
// 3. دوال مساعدة خارج الـ EventListener (Global)
// ******************************************************

// دالة التنفيذ
async function submitAddTeacher() {
    const selectedIdInput = document.getElementById('selectedTeacherId');
    const teacherId = selectedIdInput ? selectedIdInput.value : null;
    const centerId = currentCenterId || localStorage.getItem('userId'); 

    if (!teacherId) {
        alert("الرجاء البحث عن معلم واختياره من القائمة أولاً.");
        return;
    }

    const submitBtn = document.getElementById('btnConfirmAddTeacher');
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإضافة...';
    }

    try {
        const response = await fetch(`${CENTER_API_URL}/teachers/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                centerId: centerId,
                teacherId: teacherId
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("تمت إضافة المعلم للمركز بنجاح! 🎉");
            
            const modalEl = document.getElementById('inviteTeacherModal');
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();

            selectedIdInput.value = '';
            document.getElementById('selectedTeacherInfo').classList.add('d-none');

            if (typeof loadDashboardStats === 'function') loadDashboardStats();

        } else {
            alert("خطأ: " + (result.message || "فشلت العملية"));
        }
    } catch (error) {
        console.error(error);
        alert("حدث خطأ في الاتصال بالسيرفر");
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'إضافة المعلم';
        }
    }
}







// ******************************************************
// 3. دوال مساعدة خارج الـ EventListener (Global)
// ******************************************************

// دالة اختيار المعلم من القائمة


// دالة إرسال الإضافة للسيرفر (يتم استدعاؤها من زر الحفظ في المودال)
window.submitAddTeacher = async function () {
    const selectedIdInput = document.getElementById('selectedTeacherId');
    const teacherId = selectedIdInput ? selectedIdInput.value : null;
    const centerId = currentCenterId || localStorage.getItem('userId'); // تأكد من وجود currentCenterId

    if (!teacherId) {
        alert("الرجاء البحث عن معلم واختياره من القائمة أولاً.");
        return;
    }

    const submitBtn = document.querySelector('#inviteTeacherModal .btn-primary');
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإضافة...';
    }

    try {
        const response = await fetch(`${CENTER_API_URL}/teachers/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                centerId: centerId,
                teacherId: teacherId
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("تمت إضافة المعلم للمركز بنجاح! 🎉");
            
            // إغلاق المودال
            const modalEl = document.getElementById('inviteTeacherModal');
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.hide();

            // تنظيف الحقول
            selectedIdInput.value = '';
            document.getElementById('selectedTeacherInfo').classList.add('d-none');

            // تحديث الإحصائيات لرؤية التغيير في عدد المعلمين
            if (typeof loadDashboardStats === 'function') loadDashboardStats();

        } else {
            alert("خطأ: " + (result.message || "فشلت العملية"));
        }
    } catch (error) {
        console.error(error);
        alert("حدث خطأ في الاتصال بالسيرفر");
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'إضافة المعلم';
        }
    }
}







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

    // ******************************************************
    // 3. دوال إدارة الدورات (الخاصة بالمركز)
    // ******************************************************
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

// --- نظام الإشعارات للمركز ---

async function checkNotifications() {
    const notifCountEl = document.getElementById('notif-count');
    const notifItemsEl = document.getElementById('notif-items');
if (!notifCountEl || !notifItemsEl) {
        return; 
    }

    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch('http://localhost:5220/api/Notifications/unread', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const notifications = await response.json();

            if (notifications.length > 0) {
                // 1. إظهار الرقم الأحمر
                notifCountEl.innerText = notifications.length;
                notifCountEl.classList.remove('d-none');

                // 2. تعبئة القائمة بالرسائل
                notifItemsEl.innerHTML = notifications.map(n => `
                    <li class="p-3 border-bottom border-secondary hover-notif" onclick="markAsRead(${n.id})">
                        <div class="fw-bold text-info small">${n.title}</div>
                        <div class="text-white-50 x-small mt-1">${n.message}</div>
                        <div class="text-muted" style="font-size: 10px; margin-top: 5px;">
                            ${new Date(n.createdAt).toLocaleTimeString('ar-JO')}
                        </div>
                    </li>
                `).join('');
            } else {
                notifCountEl.classList.add('d-none');
                notifItemsEl.innerHTML = '<li class="p-3 text-center text-muted small">لا توجد إشعارات جديدة</li>';
            }
        }
    } catch (error) {
        console.error("فشل جلب الإشعارات:", error);
    }
}

// دالة لجعل الإشعار "مقروء" عند الضغط عليه
async function markAsRead(id) {
    const token = localStorage.getItem('authToken');
    await fetch(`http://localhost:5220/api/Notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    checkNotifications(); // تحديث القائمة فوراً
}

// تشغيل الفحص عند تحميل الصفحة وكل دقيقة
document.addEventListener('DOMContentLoaded', () => {
    checkNotifications();
    setInterval(checkNotifications, 60000); 
});



// 2. دالة الرفع
async function uploadFile(input) {
    if (!input.files[0]) return;
    
    const formData = new FormData();
    formData.append('file', input.files[0]);
    formData.append('title', input.files[0].name); // نستخدم اسم الملف كعنوان مؤقت
    formData.append('category', 'عام');

    try {
        const res = await fetch(`${LIBRARY_API_URL}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            alert("تم رفع الملف بنجاح! 🎉");
        }
    } catch (e) { alert("فشل الرفع"); }
}

const EVENTS_API_URL = "http://localhost:5220/api/Events";

// 1. دالة جلب وعرض الفعاليات
async function loadCenterEvents() {
    const container = document.getElementById('events-list-container');
    const token = localStorage.getItem('authToken');

    try {
        const res = await fetch(`${EVENTS_API_URL}/my-events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const events = await res.json();
        
        if (events.length === 0) {
            container.innerHTML = '<div class="text-center text-white-50 py-5">لا توجد فعاليات مجدولة حالياً.</div>';
            return;
        }

        container.innerHTML = events.map(ev => `
            <div class="glass-form mb-3 d-flex position-relative overflow-hidden">
                <div class="position-absolute top-0 end-0 bottom-0 bg-success" style="width: 5px;"></div>
                <div class="p-3 text-center border-start border-secondary d-flex flex-column justify-content-center" style="min-width: 100px;">
                    <span class="text-white fw-bold h4 m-0">${new Date(ev.date).getDate()}</span>
                    <span class="text-white-50 small">${new Date(ev.date).toLocaleString('ar-EG', {month: 'short'})}</span>
                </div>
                <div class="p-3 flex-grow-1">
                    <h5 class="text-white mb-1">${ev.title}</h5>
                    <div class="d-flex gap-3 small text-white-50 mt-2">
                        <span><i class="fa-solid fa-clock ms-1"></i> ${ev.time}</span>
                        <span><i class="fa-solid fa-money-bill ms-1"></i> ${ev.registrationFee > 0 ? ev.registrationFee + ' د.أ' : 'مجانية'}</span>
                    </div>
                </div>
                <div class="p-3 d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEvent(${ev.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error("Error loading events:", e); }
}

// 2. معالج إرسال الفورم (النشر)
document.getElementById('add-event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    const eventData = {
        title: document.getElementById('event-title').value,
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value,
        registrationFee: parseFloat(document.getElementById('event-fee').value) || 0
    };

    try {
        const res = await fetch(`${EVENTS_API_URL}/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(eventData)
        });

        if (res.ok) {
            alert("تم نشر الفعالية بنجاح! 🎊");
            e.target.reset(); // تصفير الفورم
            loadCenterEvents(); // تحديث القائمة
        }
    } catch (e) { alert("فشل في نشر الفعالية"); }
});


async function handleAddEvent(event) {
    event.preventDefault();
    const eventData = {
        title: document.querySelector('#center-events input[type="text"]').value,
        date: document.querySelector('#center-events input[type="date"]').value,
        time: document.querySelector('#center-events input[type="time"]').value,
        description: "وصف افتراضي للفعالية", // يمكن إضافة textarea له
        location: "القاعة الرئيسية",
        registrationFee: parseFloat(document.querySelector('#center-events input[type="number"]').value) || 0
    };

    try {
        const res = await fetch(`${EVENTS_API_URL}/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(eventData)
        });

        if (res.ok) {
            alert("تم نشر الفعالية بنجاح! 🎉");
            loadCenterEvents(); // تحديث القائمة
        }
    } catch (e) { alert("حدث خطأ أثناء النشر"); }
}

const TASKS_API_URL = "http://localhost:5220/api/Tasks";

// 1. جلب وتوزيع المهام
async function loadTasks() {
    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch(`${TASKS_API_URL}/my-tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await res.json();

        // تفريغ الحاويات
        const containers = {
            'Todo': document.getElementById('todo-tasks-container'),
            'Doing': document.getElementById('doing-tasks-container'),
            'Done': document.getElementById('done-tasks-container')
        };
        Object.values(containers).forEach(c => c.innerHTML = '');

        tasks.forEach(t => {
            const taskHtml = `
                <div class="p-3 mb-2 bg-dark rounded border ${t.priority === 'Urgent' ? 'border-danger' : 'border-secondary'} position-relative hover-scale">
                    ${t.priority === 'Urgent' ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2" style="font-size:0.6rem">عاجل</span>' : ''}
                    <h6 class="text-white mt-1">${t.title}</h6>
                    <p class="text-white-50 small mb-2">${t.description || ''}</p>
                    <div class="d-flex justify-content-between">
                        <button onclick="deleteTask(${t.id})" class="btn btn-sm text-danger p-0"><i class="fa-solid fa-trash-can"></i></button>
                        <div>
                            ${t.status !== 'Todo' ? `<button onclick="moveTask(${t.id}, 'Todo')" class="btn btn-sm text-white-50 p-0"><i class="fa-solid fa-arrow-right"></i></button>` : ''}
                            ${t.status !== 'Doing' ? `<button onclick="moveTask(${t.id}, 'Doing')" class="btn btn-sm text-info p-0"><i class="fa-solid fa-spinner"></i></button>` : ''}
                            ${t.status !== 'Done' ? `<button onclick="moveTask(${t.id}, 'Done')" class="btn btn-sm text-success p-0"><i class="fa-solid fa-check-double"></i></button>` : ''}
                        </div>
                    </div>
                </div>
            `;
            containers[t.status].innerHTML += taskHtml;
        });
    } catch (e) { console.error("Error loading tasks", e); }
}

// 2. نقل المهمة بين الحالات
async function moveTask(id, newStatus) {
    const token = localStorage.getItem('authToken');
    await fetch(`${TASKS_API_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newStatus)
    });
    loadTasks();
}

// 3. حذف مهمة
async function deleteTask(id) {
    if(!confirm("حذف المهمة؟")) return;
    const token = localStorage.getItem('authToken');
    await fetch(`${TASKS_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadTasks();
}