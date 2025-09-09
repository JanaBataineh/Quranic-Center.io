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

      if (isLogin) {
        if ((email === "admin@example.com" && password === "123456") ||
            (email === "user@example.com" && password === "123456")) {
          window.location.href = "index.html";
        } else {
          errorText.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
          errorMessage.classList.remove('hidden');
        }
      } else {
        // تحقق تجريبي للتسجيل
        if (email && password.length >= 6) {
          loginTitle.textContent = "تم إنشاء الحساب بنجاح!";
          loginSubtitle.textContent = "يمكنك الآن تسجيل الدخول.";
          errorMessage.classList.add('hidden');
          isLogin = true;
          toggleBtn.textContent = "إنشاء حساب جديد";
          submitText.textContent = "تسجيل الدخول";
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

});
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('errorMessage');

  if (email === "janabataineh49@gmail.com" && password === "2004") {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "dashbord.html";
  } else {
    errorDiv.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    errorDiv.classList.remove('hidden');
  }
});
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const type = document.getElementById('accountType').value;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('login-error');

  let centers = JSON.parse(localStorage.getItem('centers') || '[]');
  let user = centers.find(c => c.email === email && c.password === password && c.type === type);

  if (!type) {
    errorDiv.textContent = "يرجى اختيار نوع الحساب";
    errorDiv.style.display = "block";
    return;
  }

  if (user) {
    localStorage.setItem('currentCenter', email);
    if (type === "center") {
      window.location.href = "dashbordcenters.html";
    } else {
      window.location.href = "index.html"; // أو صفحة الطالب إذا كانت موجودة
    }
  } else {
    errorDiv.textContent = "البريد الإلكتروني أو كلمة المرور أو نوع الحساب غير صحيح";
    errorDiv.style.display = "block";
  }
});
document.querySelectorAll(".segmented-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".segmented-btn").forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    this.classList.add("active");
    this.setAttribute("aria-pressed", "true");

    // تحديث القيمة المخفية
    document.getElementById("accountMode").value = this.dataset.type;
  });
});
