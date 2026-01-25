const API_URL = window.CONFIG 
    ? window.CONFIG.getUrl(window.CONFIG.ENDPOINTS.CONTACT) 
    : "http://localhost:5220/api/Contact";

let allMessages = []; // متغير عام لتخزين الرسائل

document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});

// 1. جلب الرسائل
async function loadMessages() {
    const token = localStorage.getItem('authToken');
    const tbody = document.getElementById('messagesTableBody');
    const unreadCountEl = document.getElementById('unreadCount');
    
    if(!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">جاري تحميل الرسائل...</td></tr>';

    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            allMessages = await response.json();
            
            // تحديث عدد الرسائل غير المقروءة
            const unread = allMessages.filter(m => !m.isRead).length;
            if(unreadCountEl) unreadCountEl.textContent = unread;

            renderMessages(allMessages);
        } else {
            console.error("Server Error:", response.status);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">فشل تحميل البيانات</td></tr>';
        }
    } catch (error) {
        console.error("Network Error:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">خطأ في الاتصال بالسيرفر</td></tr>';
    }
}

// 2. رسم الجدول
function renderMessages(messages) {
    const tbody = document.getElementById('messagesTableBody');
    tbody.innerHTML = ''; // تفريغ الجدول

    if (!messages || messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">لا توجد رسائل واردة</td></tr>';
        return;
    }

    // ترتيب الرسائل: الأحدث أولاً
    // ملاحظة: قمنا بعمل نسخة حتى لا نعكس المصفوفة الأصلية مرتين
    [...messages].reverse().forEach((msg, index) => {
        const dateObj = new Date(msg.createdAt || msg.sentAt || Date.now());
        const dateStr = dateObj.toLocaleDateString('ar-JO');

        const statusBadge = msg.isRead 
            ? '<span class="badge bg-read">مقروء</span>' 
            : '<span class="badge bg-new">جديد</span>';
            
        const rowClass = msg.isRead ? '' : 'unread-row';

        const tr = `
            <tr class="${rowClass}" onclick="openMessageModal('${msg.id}')">
                <td>${index + 1}</td>
                <td style="font-weight:bold; color:white;">${msg.senderName}</td>
                <td>${msg.subject}</td>
                <td>${dateStr}</td>
                <td>${statusBadge}</td>
                <td class="actions-cell">
                    <button class="action-btn btn-view" onclick="event.stopPropagation(); openMessageModal('${msg.id}')">
                        قراءة
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteMessage(event, '${msg.id}')">حذف</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}
// دالة فتح المودال (إجبار الظهور)
window.openMessageModal = function(id) {
    console.log("جاري فتح الرسالة رقم:", id);

    const msg = allMessages.find(m => m.id == id);
    if(!msg) return;

    // تعبئة البيانات
    if(document.getElementById('msgSender')) document.getElementById('msgSender').textContent = msg.senderName || 'غير معروف';
    if(document.getElementById('msgEmail')) document.getElementById('msgEmail').textContent = msg.email || '-';
    if(document.getElementById('msgSubject')) document.getElementById('msgSubject').textContent = msg.subject || 'بدون عنوان';
    if(document.getElementById('msgContent')) document.getElementById('msgContent').textContent = msg.content || msg.message || '';

    // زر الرد
    const replyBtn = document.getElementById('replyBtn');
    if(replyBtn && msg.email) {
        replyBtn.href = `mailto:${msg.email}?subject=رد: ${msg.subject}`;
    }

    // إظهار المودال (الحل الجذري لمشكلة CSS)
    const modal = document.getElementById('messageModal');
    if (modal) {
        // نستخدم setProperty لفرض display: flex مع !important لتجاهل أي CSS خارجي
        modal.style.setProperty('display', 'flex', 'important');
        modal.classList.add('show'); 
    }
}

// دالة إغلاق المودال
window.closeModal = function() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        // إخفاء إجباري
        modal.style.setProperty('display', 'none', 'important');
        modal.classList.remove('show');
    }
}



// إغلاق المودال عند النقر خارج الصندوق
window.onclick = function(event) {
    const modal = document.getElementById('messageModal');
    // نغلق فقط إذا ضغط المستخدم على الخلفية المعتمة وليس الصندوق نفسه
    if (event.target == modal) {
        closeModal();
    }
}

// 5. حذف رسالة
window.deleteMessage = async function(event, id) {
    event.stopPropagation();
    
    if(!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert("تم الحذف بنجاح");
            loadMessages(); // إعادة تحميل الجدول
        } else {
            alert("فشل الحذف");
        }
    } catch (error) {
        console.error(error);
        alert("خطأ في الاتصال");
    }
}

