const CONFIG = {
    API_BASE_URL: 'http://localhost:5220/api', 
    
    // ... باقي الكود كما هو
    ENDPOINTS: {
        AUTH: '/Auth',
        ADMIN: '/Admin',
        CENTER: '/Center',
        STUDENT: '/Student',
        PUBLIC: '/Public',
        CONTACT: '/Contact'
    },

    getUrl: function(endpoint) {
        return `${this.API_BASE_URL}${endpoint}`;
    }
};