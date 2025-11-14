document.addEventListener('DOMContentLoaded', function () {
  // 🌟🌟🌟 التصحيح: قمنا بتعريف المتغير هنا 🌟🌟🌟
  let isLogin = true;

  // تعريف العناصر من HTML
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const submitBtn = document.getElementById('submitBtn');
  const spinner = document.getElementById('spinner');
  const submitText = document.getElementById('submitText');
  const toggleBtn = document.getElementById('toggleBtn');
  const loginTitle = document.getElementById('loginTitle');
  const loginSubtitle = document.getElementById('loginSubtitle');
  const accountModeInput = document.getElementById('accountMode'); 
  const signupFields = document.getElementById('signupFields'); 
  
  // 🌟🌟🌟 التصحيح: استخدام السيرفر المحلي 🌟🌟🌟
  const API_BASE_URL = 'https://quranic-centerio-production.up.railway.app/api/Auth';

  // 1. دالة لتبديل الحالة بين الدخول والتسجيل
  function toggleLoginState() {
    isLogin = !isLogin;
    
    loginTitle.textContent = isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد";
    loginSubtitle.textContent = isLogin ? "أهلاً بك في منصة معاهد الوحي" : "املأ الحقول لإنشاء حساب طالب جديد";
    submitText.textContent = isLogin ? "تسجيل الدخول" : "إنشاء حساب";
    toggleBtn.textContent = isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول";
    errorMessage.classList.add('hidden');

    if (isLogin) {
        signupFields.classList.add('hidden');
        // إزالة خاصية 'required' من حقول التسجيل عند التبديل لوضع الدخول
        document.querySelectorAll('#signupFields input').forEach(input => input.required = false);

    } else {
        signupFields.classList.remove('hidden');
        // إضافة خاصية 'required' لحقول التسجيل الجديدة
        document.querySelectorAll('#signupFields input').forEach(input => input.required = true);
        
        // عند الانتقال لوضع التسجيل، نفعّل خيار "الطالب" افتراضياً
        accountModeInput.value = 'student'; 
        
        // تفعيل زر الطالب واجهة المستخدم (للحفاظ على الشكل)
        document.querySelectorAll(".segmented-btn").forEach(b => {
            if (b.textContent.trim() === 'طالب') { 
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }
  }


  loginForm.addEventListener('submit', async function (e) { 
    e.preventDefault();
    errorMessage.classList.add('hidden');
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    submitText.textContent = isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...';

    // بيانات النموذج
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    // نستخدم setTimeout لمحاكاة زمن التحميل (يمكن إزالته لاحقًا)
    setTimeout(async () => { 
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
        submitText.textContent = isLogin ? 'تسجيل الدخول' : 'إنشاء حساب';

        if (isLogin) {
            // *** منطق تسجيل الدخول عبر API ***
            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    errorText.textContent = errorData.message || "فشل تسجيل الدخول. تحقق من بياناتك.";
                    errorMessage.classList.remove('hidden');
                    return;
                }

                const data = await response.json();
                
                // (user_info.userType)
                const userType = data.user_info.userType; 
                
                // حفظ الرمز المميز ونوع المستخدم (مفتاح المصادقة)
                localStorage.setItem('authToken', data.token); 
                localStorage.setItem('currentUserType', userType); 
                localStorage.setItem('currentStudentEmail', email); // (مهم للوحة تحكم المركز)
                
                // (إضافة الأعلام التي تعتمد عليها الصفحات الأخرى)
                if (userType === 'Admin') {
                    localStorage.setItem("isAdmin", "true"); 
                    window.location.href = "dashbord.html";

                } else if (userType === 'Center') {
                    // (يمكن إضافة localStorage.setItem("isCenter", "true");)
                    window.location.href = "dashbordcenters.html";

                } else { // Student (الطالب)
                    localStorage.setItem("isStudent", "true"); 
                    window.location.href = "student-dashboard.html"; 
                }

            } catch (error) {
                console.error("Fetch Error:", error);
                errorText.textContent = "حدث خطأ في الاتصال بالخادم. تأكد من تشغيل ASP.NET Core.";
                errorMessage.classList.remove('hidden');
            }

        } else {
            // *** منطق التسجيل (إنشاء حساب) عبر API ***
            const accountType = accountModeInput.value; 
            const firstName = loginForm.firstName.value.trim();
            const middleName = loginForm.middleName.value.trim();
            const lastName = loginForm.lastName.value.trim();
            const age = parseInt(loginForm.age.value.trim());

            if (!firstName || !middleName || !lastName || !age || !email || password.length < 6) {
                errorText.textContent = "يرجى ملء جميع الحقول المطلوبة (كلمة المرور 6 أحرف على الأقل).";
                errorMessage.classList.remove('hidden');
                return;
            }
            
            const registrationData = {
                firstName, middleName, lastName, age, email, password,
                userType: accountType
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registrationData)
                });

                if (response.status === 409) { // 409 Conflict: البريد مسجل بالفعل
                    errorText.textContent = "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.";
                    errorMessage.classList.remove('hidden');
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    errorText.textContent = errorData.message || "حدث خطأ في التسجيل. حاول مجدداً.";
                    errorMessage.classList.remove('hidden');
                    return;
                }
                
                const data = await response.json();
                
                alert("✅ تم إنشاء حسابك بنجاح! جاري تسجيل دخولك...");
                
                toggleLoginState(); // العودة لوضع تسجيل الدخول
                
                // تعبئة الحقول له
                loginForm.email.value = email;
                loginForm.password.value = password;

            } catch (error) {
                console.error("Fetch Error:", error);
                errorText.textContent = "حدث خطأ في الاتصال بالخادم. تأكد من تشغيل ASP.NET Core.";
                errorMessage.classList.remove('hidden');
            }
        }
    }, 1000);
  });

  // 2. حدث النقر على زر التبديل
  toggleBtn.addEventListener('click', toggleLoginState);

  // 3. منطق تبديل نوع الحساب (طالب / مركز)
  document.querySelectorAll(".segmented-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".segmented-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-pressed", "true");

      // تحديث القيمة المخفية
      const selectedType = (this.dataset.type === 'signup' || this.textContent.trim() === 'مركز') ? 'center' : 'student'; 
      accountModeInput.value = selectedType;
      
      // التحكم في ظهور الحقول الإضافية للطالب فقط
      if(!isLogin) {
          if(selectedType === 'center') {
              signupFields.classList.add('hidden');
              document.querySelectorAll('#signupFields input').forEach(input => input.required = false);
              loginSubtitle.textContent = 'املأ الحقول لإنشاء حساب مركز تعليمي.';
          } else {
              signupFields.classList.remove('hidden');
              document.querySelectorAll('#signupFields input').forEach(input => input.required = true);
              loginSubtitle.textContent = 'املأ الحقول لإنشاء حساب طالب جديد.';
          }
      }
    });
  });
  
  // تهيئة الحالة الأولية
  document.querySelector('.segmented-btn[data-type="login"]').classList.add('active');
  document.querySelector('.segmented-btn[data-type="signup"]').classList.remove('active');
});