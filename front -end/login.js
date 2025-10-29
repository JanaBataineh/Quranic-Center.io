document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const submitBtn = document.getElementById('submitBtn');
  const spinner = document.getElementById('spinner');
  const submitText = document.getElementById('submitText');
  const toggleBtn = document.getElementById('toggleBtn');
  const loginTitle = document.getElementById('loginTitle');
  const loginSubtitle = document.getElementById('loginSubtitle');
  let isLogin = true;

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    errorMessage.classList.add('hidden');
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    submitText.textContent = isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...';

    setTimeout(() => {
      spinner.classList.add('hidden');
      submitBtn.disabled = false;
      submitText.textContent = isLogin ? 'تسجيل الدخول' : 'إنشاء حساب';

      // تحقق تجريبي (استبدله بمنطقك)
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value.trim();
      
      // *** منطق تسجيل الدخول المحدث ***
      if (isLogin) {
        
        // 1. حساب الأدمن المخصص (جنى بطاينة)
        if (email === "janabataineh49@gmail.com" && password === "2004") {
          localStorage.setItem("isAdmin", "true");
          window.location.href = "dashbord.html";
        } 
        // 2. حساب الأدمن التجريبي العام
        else if (email === "admin@example.com" && password === "123456") {
            localStorage.setItem("isAdmin", "true");
            window.location.href = "dashbord.html";
        }
        // 3. حساب الطالب التجريبي
        else if (email === "user@example.com" && password === "123456") {
            // توجيه الطالب إلى لوحة تحكم الطالب الجديدة
            localStorage.setItem("isStudent", "true");
            window.location.href = "student-dashboard.html";
        } 
        // 4. حساب المركز التجريبي
        else if (email === "center@example.com" && password === "123456") {
             localStorage.setItem('currentCenter', email);
             window.location.href = "dashbordcenters.html";
        }
        // 5. محاولة تسجيل الدخول من بيانات centers/students المخزنة محلياً
        else {
            let centers = JSON.parse(localStorage.getItem('centers') || '[]');
            let user = centers.find(c => c.email === email && c.password === password);
            
            if(user) {
                localStorage.setItem('currentCenter', email);
                if (user.type === "center") {
                    window.location.href = "dashbordcenters.html";
                } else {
                    window.location.href = "student-dashboard.html"; 
                }
            } else {
                errorText.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
                errorMessage.classList.remove('hidden');
            }
        }
        
      } else {
        // منطق التسجيل (إنشاء حساب)
        if (email && password.length >= 6) {
          loginTitle.textContent = "تم إنشاء الحساب بنجاح!";
          loginSubtitle.textContent = "يمكنك الآن تسجيل الدخول.";
          errorMessage.classList.add('hidden');
          isLogin = true;
          toggleBtn.textContent = "إنشاء حساب جديد";
          submitText.textContent = "تسجيل الدخول";

          // محاكاة حفظ الحساب الجديد في localStorage (لغرض التجربة)
          let centers = JSON.parse(localStorage.getItem('centers') || '[]');
          centers.push({ email: email, password: password, type: document.getElementById('accountMode').value === 'signup' ? 'center' : 'student' });
          localStorage.setItem('centers', JSON.stringify(centers));

        } else {
          errorText.textContent = "يرجى إدخال بيانات صحيحة (كلمة المرور 6 أحرف على الأقل)";
          errorMessage.classList.remove('hidden');
        }
      }
    }, 1000);
  });

  toggleBtn.addEventListener('click', function () {
    isLogin = !isLogin;
    loginTitle.textContent = isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد";
    loginSubtitle.textContent = isLogin ? "أهلاً بك في منصة معاهد الوحي" : "أنشئ حسابك للوصول إلى جميع المميزات";
    submitText.textContent = isLogin ? "تسجيل الدخول" : "إنشاء حساب";
    toggleBtn.textContent = isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول";
    errorMessage.classList.add('hidden');
  });

  // منطق تبديل نوع الحساب (طالب / مركز)
  document.querySelectorAll(".segmented-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".segmented-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-pressed", "true");

      // تحديث القيمة المخفية
      document.getElementById("accountMode").value = this.dataset.type === 'signup' ? 'center' : 'student'; // تحديث ليكون 'center' أو 'student'
    });
  });

});