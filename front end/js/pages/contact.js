/* مسار الملف: js/pages/contact.js */

export function initializeContactPage() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // 1. تغيير الزر لوضع التحميل
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> جاري الإرسال...';

    // 2. تجميع البيانات
    const messageData = {
        senderName: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value || "",
        inquiryType: document.getElementById('inquiry-type').value, // تأكد أن الباكيند يستقبل هذا الحقل
        subject: document.getElementById('subject').value,
        content: document.getElementById('message').value
    };

    try {
        // 3. تحديد الرابط
        const baseUrl = window.CONFIG 
            ? window.CONFIG.getUrl(window.CONFIG.ENDPOINTS.CONTACT) 
            : 'http://localhost:5220/api/Contact';

        // 4. الإرسال للسيرفر
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });

        if (response.ok) {
            // 5. نجاح الإرسال: إخفاء النموذج وإظهار رسالة الشكر
            document.getElementById('form-container').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            e.target.reset();
        } else {
            const errorData = await response.json();
            alert("⚠️ فشل الإرسال: " + (errorData.message || "حدث خطأ غير متوقع"));
        }

    } catch (error) {
        console.error(error);
        alert("❌ تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً.");
    } finally {
        // إعادة الزر لوضعه الطبيعي
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// دالة لإعادة إظهار النموذج (مربوطة بزر "إرسال رسالة أخرى")
window.showContactForm = function() {
    document.getElementById('form-container').style.display = 'block';
    document.getElementById('success-message').style.display = 'none';
}