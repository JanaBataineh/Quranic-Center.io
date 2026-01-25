const CONFIG = {
    API_BASE_URL: 'http://localhost:5220/api', 
    
    // ... باقي الكود كما هو
    ENDPOINTS: {
        AUTH: '/Auth',
        ADMIN: '/Admin',
        CENTER: '/Center',
        TEACHER: '/Teacher', 
        STUDENT: '/Student',
        PUBLIC: '/Public',
        CONTACT: '/Contact',
        ENROLLMENT: '/Enrollment'
    },

    getUrl: function(endpoint) {
        return `${this.API_BASE_URL}${endpoint}`;
    }
};
// 1. التعريف للمتصفح (Global Variable) - هذا سيجعلها تعمل في كل الصفحات
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// 2. التعريف للـ Webpack (CommonJS) - هذا سيمنع أخطاء البناء
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { CONFIG };
}







