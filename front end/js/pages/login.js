/* js/pages/login.js */
document.addEventListener('DOMContentLoaded', function () {
  
    // 1. التعريفات الأساسية
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return; 
  
    // تعريف المتغيرات
    let isLogin = true;
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
    
    // الرابط الأساسي
    const API_BASE_URL = (typeof CONFIG !== 'undefined') ? CONFIG.getUrl(CONFIG.ENDPOINTS.AUTH) : "http://localhost:5000/api/auth";

    // ==========================================
    // 2. إعداد زر جوجل (Google Sign-In) - المصحح
    // ==========================================

    // أولاً: تعريف دالة المعالجة (يجب أن تكون موجودة لكي يراها الزر)
    async function handleGoogleResponse(response) {
        const idToken = response.credential;
        console.log("Google Token Received");

        try {
            if(spinner) spinner.classList.remove('hidden');
            if(submitBtn) submitBtn.disabled = true;

            const res = await fetch(`${API_BASE_URL}/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: idToken })
            });

            if (!res.ok) throw new Error("فشل التحقق من Google Token");

            const data = await res.json();
            const userType = data.user_info.userType || data.user_info.UserType; 
            
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUserType', userType);
            
            if (userType === 'Student' || userType === 'student') {
                localStorage.setItem("isStudent", "true");
                window.location.href = "student-dashboard.html";
            } else if (userType === 'Center' || userType === 'center') {
                window.location.href = "dashbordcenters.html";
            } else {
                window.location.href = "index.html";
            }

        } catch (error) {
            console.error(error);
            if(errorText) errorText.textContent = "فشل تسجيل الدخول بواسطة جوجل.";
            if(errorMessage) errorMessage.classList.remove('hidden');
        } finally {
            if(spinner) spinner.classList.add('hidden');
            if(submitBtn) submitBtn.disabled = false;
        }
    }

    // ثانياً: دالة تهيئة الزر مع الانتظار (Retry Logic)
    function initializeGoogleButton() {
        if (typeof google !== 'undefined') {
            try {
                google.accounts.id.initialize({
                    client_id: "387956684974-8drsfh6eo20946h0hi2gjtbuuee0f923.apps.googleusercontent.com",
                    callback: handleGoogleResponse
                });
        
                google.accounts.id.renderButton(
                    document.getElementById("googleBtn"),
                    { theme: "filled_blue", size: "large", width: "100%", text: "continue_with" } 
                );
                console.log("✅ Google Button Rendered Successfully");
            } catch (e) {
                console.error("❌ Error rendering Google button:", e);
            }
        } else {
            console.log("⏳ Waiting for Google library...");
            setTimeout(initializeGoogleButton, 500); // المحاولة كل نصف ثانية
        }
    }

    // تشغيل دالة تهيئة الزر
    initializeGoogleButton();

    // ==========================================
    // 3. دوال الواجهة (Toggle Login/Signup)
    // ==========================================
    function toggleLoginState() {
      isLogin = !isLogin;
      
      loginTitle.textContent = isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد";
      loginSubtitle.textContent = isLogin ? "أهلاً بك في منصة معاهد الوحي" : "املأ الحقول لإنشاء حساب طالب جديد";
      submitText.textContent = isLogin ? "تسجيل الدخول" : "إنشاء حساب";
      toggleBtn.textContent = isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول";
      if(errorMessage) errorMessage.classList.add('hidden');
  
      if (isLogin) {
          if(signupFields) {
              signupFields.classList.add('hidden');
              document.querySelectorAll('#signupFields input').forEach(input => input.required = false);
          }
      } else {
          if(signupFields) {
              signupFields.classList.remove('hidden');
              document.querySelectorAll('#signupFields input').forEach(input => input.required = true);
          }
          if(accountModeInput) accountModeInput.value = 'student'; 
          
          document.querySelectorAll(".segmented-btn").forEach(b => {
              if (b.textContent.trim() === 'طالب') b.classList.add('active');
              else b.classList.remove('active');
          });
      }
    }
  
    // ==========================================
    // 4. التعامل مع النموذج العادي (Login/Register Form)
    // ==========================================
    loginForm.addEventListener('submit', async function (e) { 
      e.preventDefault();
      if(errorMessage) errorMessage.classList.add('hidden');
      submitBtn.disabled = true;
      if(spinner) spinner.classList.remove('hidden');
      submitText.textContent = isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...';
  
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value.trim();
  
      setTimeout(async () => { 
          if(spinner) spinner.classList.add('hidden');
          submitBtn.disabled = false;
          submitText.textContent = isLogin ? 'تسجيل الدخول' : 'إنشاء حساب';
  
          if (isLogin) {
              // *** تسجيل الدخول العادي ***
              try {
                  const response = await fetch(`${API_BASE_URL}/login`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, password })
                  });
  
                  if (!response.ok) {
                      const errorData = await response.json();
                      errorText.textContent = errorData.message || "فشل تسجيل الدخول.";
                      if(errorMessage) errorMessage.classList.remove('hidden');
                      return;
                  }
  
                  const data = await response.json();
                  const userType = data.user_info.userType; 
                  
                  localStorage.setItem('authToken', data.token); 
                  localStorage.setItem('currentUserType', userType); 
                  
                  if (userType === 'Admin') {
                      window.location.href = "dashbord.html";
                  } else if (userType === 'Center') {
                      window.location.href = "dashbordcenters.html";
                  } else { 
                      localStorage.setItem("isStudent", "true"); 
                      window.location.href = "student-dashboard.html"; 
                  }
  
              } catch (error) {
                  console.error("Fetch Error:", error);
                  errorText.textContent = "حدث خطأ في الاتصال بالخادم.";
                  if(errorMessage) errorMessage.classList.remove('hidden');
              }
  
          } else {
              // *** إنشاء حساب جديد ***
              const accountType = accountModeInput ? accountModeInput.value : 'student'; 
              const firstName = document.getElementById('firstName').value.trim();
              const middleName = document.getElementById('middleName').value.trim();
              const lastName = document.getElementById('lastName').value.trim();
              const age = parseInt(document.getElementById('age').value.trim());
  
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
  
                  if (response.status === 409) {
                      errorText.textContent = "البريد مسجل بالفعل.";
                      if(errorMessage) errorMessage.classList.remove('hidden');
                      return;
                  }
  
                  if (!response.ok) {
                      const errorData = await response.json();
                      errorText.textContent = errorData.message || "حدث خطأ.";
                      if(errorMessage) errorMessage.classList.remove('hidden');
                      return;
                  }
                  
                  alert("✅ تم إنشاء حسابك بنجاح!");
                  toggleLoginState();
                  loginForm.email.value = email;
                  loginForm.password.value = password;
  
              } catch (error) {
                  console.error(error);
                  errorText.textContent = "خطأ في الاتصال.";
                  if(errorMessage) errorMessage.classList.remove('hidden');
              }
          }
      }, 1000);
    });
  
    if (toggleBtn) toggleBtn.addEventListener('click', toggleLoginState);
  
    document.querySelectorAll(".segmented-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        document.querySelectorAll(".segmented-btn").forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        this.classList.add("active");
        this.setAttribute("aria-pressed", "true");
  
        const selectedType = (this.dataset.type === 'signup' || this.textContent.trim() === 'مركز') ? 'center' : 'student'; 
        if(accountModeInput) accountModeInput.value = selectedType;
        
        if(!isLogin) {
            if(selectedType === 'center') {
                if(signupFields) signupFields.classList.add('hidden');
                if(loginSubtitle) loginSubtitle.textContent = 'املأ الحقول لإنشاء حساب مركز تعليمي.';
            } else {
                if(signupFields) signupFields.classList.remove('hidden');
                if(loginSubtitle) loginSubtitle.textContent = 'املأ الحقول لإنشاء حساب طالب جديد.';
            }
        }
      });
    });
    
    const loginBtn = document.querySelector('.segmented-btn[data-type="login"]');
    const signupBtn = document.querySelector('.segmented-btn[data-type="signup"]');
    if(loginBtn) loginBtn.classList.add('active');
    if(signupBtn) signupBtn.classList.remove('active');

}); // 🛑 تأكد أن هذا القوس هو آخر شيء في الملف