/* js/pages/login.js - النسخة النهائية والمصححة */
document.addEventListener('DOMContentLoaded', function () {
    
    // 1. التعريفات الأساسية
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return; 
  
    const studentFields = document.getElementById('studentFields'); 
    const centerFields = document.getElementById('centerFields');
    const teacherFields = document.getElementById('teacherFields'); 
    const accountModeInput = document.getElementById('accountMode'); 
    
    let isLogin = true; 
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const submitText = document.getElementById('submitText');
    const toggleBtn = document.getElementById('toggleBtn');
    const loginTitle = document.getElementById('loginTitle');
    const loginSubtitle = document.getElementById('loginSubtitle');
    const signupFields = document.getElementById('signupFields'); 
    
    // رابط الـ API
    const API_BASE_URL = (typeof CONFIG !== 'undefined') 
        ? CONFIG.getUrl(CONFIG.ENDPOINTS.AUTH) 
        : "http://localhost:5220/api/auth";

    // 2. إدارة أزرار التبديل (طالب/معلم/مركز)
    const tabButtons = document.querySelectorAll('.segmented-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // تحديث الشكل
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');

            // تحديد النوع وتحديث الحقل المخفي
            const selectedType = this.getAttribute('data-type') || 'student'; 
            if(accountModeInput) accountModeInput.value = selectedType;

            // تحديث الواجهة إذا كنا في وضع "إنشاء حساب"
            if (!isLogin) {
                updateUIForSignup(selectedType);
            }
        });
    });

    // 3. التبديل بين "تسجيل الدخول" و "إنشاء حساب"
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isLogin = !isLogin; 
            if(errorMessage) errorMessage.classList.add('hidden'); 

            if (isLogin) {
                // وضع تسجيل الدخول
                loginTitle.textContent = 'تسجيل الدخول';
                toggleBtn.textContent = 'إنشاء حساب جديد';
                document.getElementById('toggleQuestion').textContent = 'ليس لديك حساب؟';
                submitText.textContent = 'تسجيل الدخول';
                loginSubtitle.textContent = 'أهلاً بك في منصة معاهد الوحي';
                
                if(studentFields) studentFields.classList.add('hidden');
                if(centerFields) centerFields.classList.add('hidden');
                if(teacherFields) teacherFields.classList.add('hidden');
            } else {
                // وضع إنشاء الحساب
                loginTitle.textContent = 'إنشاء حساب جديد';
                toggleBtn.textContent = 'تسجيل الدخول';
                document.getElementById('toggleQuestion').textContent = 'لديك حساب بالفعل؟';
                submitText.textContent = 'إنشاء الحساب';
                
                const currentBtn = document.querySelector('.segmented-btn.active');
                const currentType = currentBtn ? currentBtn.getAttribute('data-type') : 'student';
                updateUIForSignup(currentType);
            }
        });
    }

    // 4. معالجة زر الإرسال الرئيسي
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email').value;
            const passwordInput = document.getElementById('password').value;

            if (!emailInput || !passwordInput) {
                showError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
                return;
            }
            setLoading(true);
            try {
                if (isLogin) {
                    await handleLogin(emailInput, passwordInput);
                } else {
                    await handleSignup(emailInput, passwordInput);
                }
            } catch (error) {
                console.error(error);
                showError("حدث خطأ غير متوقع.");
            } finally {
                setLoading(false);
            }
        });
    }

    // ==========================================
    // 5. دالة تسجيل الدخول (العادي) - تم تحديثها ✅
    // ==========================================
    async function handleLogin(email, password) {
        const loginData = { email: email, password: password };

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ هنا التغيير: نستخدم الدالة الموحدة بدلاً من تكرار الكود
                handleLoginSuccess(data);
            } else {
                showError(data.message || "فشل تسجيل الدخول.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            showError("خطأ في الاتصال بالسيرفر.");
        }
    }

    // ==========================================
    // 6. دالة تسجيل الدخول (جوجل) - مربوطة بـ window
    // ==========================================
    window.handleGoogleCredentialResponse = async (response) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: response.credential }) 
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // ✅ استخدام الدالة الموحدة
                handleLoginSuccess(data); 
            } else {
                showError(data.message || "فشل تسجيل الدخول عبر جوجل.");
            }
        } catch (error) {
            console.error(error);
            showError("حدث خطأ أثناء الاتصال بجوجل.");
        } finally {
            setLoading(false);
        }
    };


// ==========================================
    // 7. الدالة الموحدة لمعالجة النجاح (مصححة وكاملة)
    // ==========================================

function handleLoginSuccess(data) {
    console.log("📥 Server Response:", data); 

    // 1. تنظيف الذاكرة القديمة
    localStorage.clear();

    // 2. تعريف المتغيرات المحتملة للبيانات لضمان عدم حدوث خطأ
    const userInfo = data.user_info || {};
    const userObj = data.user || {};

    // 3. استخراج التوكين (Token) - البحث في كل مكان
    const token = data.token || data.jwt || userInfo.token || userObj.token;

    // 4. استخراج معرف المستخدم (ID) - بحث شامل
    // نبحث في الجذر (data) أولاً، ثم user_info، ثم user
    const userId = data.userId || data.id || data.Id || 
                   userInfo.userId || userInfo.id || userInfo.Id || 
                   userObj.userId || userObj.id || userObj.Id;

    // 5. استخراج معرف المركز
    // نبحث عن centerId في كل مكان، وإذا لم نجده وكان المستخدم "مركز" نستخدم userId
    let centerId = data.centerId || userInfo.centerId || userObj.centerId;

    // 6. استخراج نوع المستخدم
    const rawUserType = data.userType || userInfo.userType || userObj.userType || 'Student';
    const userType = rawUserType.toLowerCase(); 

    // 7. استخراج الاسم
    let fullName = "مستخدم";
    // تجميع الاسم من أي مكان متاح
    const possibleName = data.fullName || userInfo.fullName || userObj.fullName || 
                         data.firstName || userInfo.firstName || userObj.firstName;
                         
    if (possibleName) {
        fullName = possibleName;
        // إضافة الاسم الأخير إن وجد
        const lastName = data.lastName || userInfo.lastName || userObj.lastName || '';
        if(data.firstName || userInfo.firstName) fullName += ` ${lastName}`;
    }

    // === 🛑 التحقق من البيانات قبل الحفظ ===
    if (!token || !userId) {
        console.error("❌ خطأ: البيانات القادمة من السيرفر غير مكتملة!", { token, userId });
        showError("فشل تسجيل الدخول: استجابة السيرفر ناقصة.");
        return; 
    }

    // === ✅ حفظ البيانات ===
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);

    // منطق حفظ معرف المركز
    if (centerId) {
        localStorage.setItem('currentCenterId', centerId);
    } else if (userType === 'center') {
        console.warn("⚠️ تنبيه: استخدام userId بدلاً من centerId");
        localStorage.setItem('currentCenterId', userId);
    }

    localStorage.setItem('currentUserType', userType);
    localStorage.setItem('currentUserName', fullName);

if (userType === 'center') {
        localStorage.setItem('isCenterAdmin', 'true');
    }
    
    if (userType === 'admin') {
        localStorage.setItem('isAdmin', 'true'); // ✅ هذا السطر ضروري جداً لصفحة الأدمن
        localStorage.setItem('isCenterAdmin', 'true'); // صلاحيات إضافية لو لزم الأمر
    }

    if (userType === 'student') {
        localStorage.setItem('isStudent', 'true');
    }
if (userType === 'teacher') {
        localStorage.setItem('isTeacher', 'true');
    }
    console.log(`✅ Login Success! User: ${fullName}, Role: ${userType}, ID: ${userId}`);
    
    // التوجيه
    redirectUser(userType);
}
    


// ==========================================
    // 8. دالة إنشاء الحساب
    // ==========================================
    async function handleSignup(email, password) {
        const accountMode = document.getElementById('accountMode').value; 
        let registerData = {
            email: email,
            password: password,
            userType: accountMode 
        };

        if (accountMode === 'center') {
            const centerName = document.getElementById('centerName').value;
            const centerPhone = document.getElementById('centerPhone').value;
            const centerManager = document.getElementById('centerManager').value;
            if (!centerName || !centerPhone) { showError("الاسم ورقم الهاتف مطلوبان."); return; }
            
            registerData.firstName = centerName;
            registerData.lastName = centerManager || "Admin";
            registerData.phoneNumber = centerPhone;
            registerData.middleName = "-"; 
            registerData.age = 0;           
        } 

        
else if (accountMode === 'teacher') {
            // 1. قراءة الحقول الثلاثة المنفصلة
            const fName = document.getElementById('teacherFirstName').value.trim();
            const mName = document.getElementById('teacherMiddleName').value.trim();
            const lName = document.getElementById('teacherLastName').value.trim();
            const teacherPhone = document.getElementById('teacherPhone').value.trim();
            const specialty = document.getElementById('teacherSpecialty').value;

            // 2. التحقق من تعبئة جميع الحقول
            if (!fName || !mName || !lName || !teacherPhone) { 
                showError("يرجى تعبئة الاسم الثلاثي ورقم الهاتف."); 
                return; 
            }

            // 3. تعبئة البيانات للإرسال للسيرفر
            registerData.firstName = fName;
            registerData.middleName = mName;
            registerData.lastName = lName;
            
            registerData.phoneNumber = teacherPhone;
            registerData.specialty = specialty; 
            registerData.userType = 'Teacher'; 
            registerData.age = 30; // قيمة افتراضية
        }


        else { // student
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const age = document.getElementById('age').value;
            if (!firstName || !lastName) { showError("الاسم الأول والعائلة مطلوبان."); return; }

            registerData.firstName = firstName;
            registerData.lastName = lastName;
            registerData.middleName = document.getElementById('middleName').value;
            registerData.age = parseInt(age) || 0;
            registerData.userType = 'Student';
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            const data = await response.json();

            if (response.ok) {
                alert("تم إنشاء الحساب بنجاح! قم بتسجيل الدخول.");
                if(toggleBtn) toggleBtn.click(); 
            } else {
                showError(data.message || "فشل إنشاء الحساب.");
            }
        } catch (error) {
            console.error(error);
            showError("فشل الاتصال بالسيرفر.");
        }
    }

    // 9. دوال مساعدة
    function updateUIForSignup(type) {
        if(studentFields) studentFields.classList.add('hidden');
        if(centerFields) centerFields.classList.add('hidden');
        if(teacherFields) teacherFields.classList.add('hidden');

        if(type === 'center') {
            if(centerFields) centerFields.classList.remove('hidden');
            if(loginSubtitle) loginSubtitle.textContent = 'سجل بيانات مركزك الجديد.';
        } else if (type === 'teacher') { 
            if(teacherFields) teacherFields.classList.remove('hidden');
            if(loginSubtitle) loginSubtitle.textContent = 'انضم كمعلم لتحفيظ القرآن.';
        } else { 
            if(studentFields) studentFields.classList.remove('hidden');
            if(loginSubtitle) loginSubtitle.textContent = 'املأ الحقول لإنشاء حساب طالب.';
        }
        if(submitBtn) submitBtn.style.display = 'block';
    }




function redirectUser(userType) {
    if (!userType) { window.location.href = 'index.html'; return; }
    
    // تحويل النوع لحروف صغيرة لتجنب المشاكل
    const type = userType.toLowerCase(); 
    
    if (type === 'admin') {
        window.location.href = 'dashbord.html';
    } else if (type === 'center') {
        window.location.href = 'dashbordcenters.html'; // تأكد من اسم الملف
    } else if (type === 'teacher') {
        window.location.href = 'master-teacher-portal.html';
    } else {
        window.location.href = 'master-student-portal.html';
    }
}





    function setLoading(isLoading) {
        if (isLoading) {
            if(spinner) spinner.classList.remove('hidden');
            if(submitText) submitText.classList.add('hidden');
            if(submitBtn) submitBtn.disabled = true;
        } else {
            if(spinner) spinner.classList.add('hidden');
            if(submitText) submitText.classList.remove('hidden');
            if(submitBtn) submitBtn.disabled = false;
        }
    }

    function showError(msg) {
        if (errorText) errorText.textContent = msg;
        if (errorMessage) {
            errorMessage.classList.remove('hidden');
            setTimeout(() => errorMessage.classList.add('hidden'), 5000);
        }
    }
});