function initializeContactPage() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
}

async function handleContactFormSubmit(e) {
  e.preventDefault();
  // ... (نفس كود الإرسال الموجود لديك)
  // استخدم fetch(CONFIG.getUrl(CONFIG.ENDPOINTS.CONTACT)...)
}