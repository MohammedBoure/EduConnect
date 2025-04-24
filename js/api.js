// تأكد من وجود API_BASE_URL (يمكن استيراده أو تعريفه هنا إذا لزم الأمر)
// const API_BASE_URL = 'https://educonnect-wp9t.onrender.com';

// دالة Fetch أساسية مع معالجة التوكن والأخطاء
async function fetchApi(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // السماح بتمرير رؤوس إضافية
    };

    // إضافة توكن المصادقة إذا كان موجودًا وإذا كان الطلب ليس لتسجيل الدخول/التسجيل
    if (token && !endpoint.startsWith('/api/login') && !endpoint.startsWith('/api/register')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: headers,
        });

        // إذا كان الرد 204 No Content (مثل الحذف الناجح)، لا تحاول قراءة JSON
        if (response.status === 204) {
            return { ok: true, data: { message: "Operation successful (No Content)"} }; // أو return { ok: true }
        }

        const data = await response.json();

        if (!response.ok) {
            // التعامل مع الأخطاء الشائعة (مثل انتهاء صلاحية التوكن)
            if (response.status === 401 || response.status === 403) {
                 console.warn(`Authentication error (${response.status}) accessing ${endpoint}. Redirecting to login.`);
                 alert('جلسة العمل غير صالحة أو انتهت صلاحيتها. يرجى تسجيل الدخول مرة أخرى.');
                 logout(); // استخدم دالة الخروج من auth.js
                 // رمي خطأ لمنع استمرار الكود بعد إعادة التوجيه
                 throw new Error(`Authentication failed: ${response.status}`);
            }
            // رمي خطأ مع رسالة من الـ API إن وجدت
            throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        }

        return { ok: true, data }; // إرجاع البيانات في حالة النجاح

    } catch (error) {
        console.error(`API call failed: ${error.message}`, error);
        // إرجاع كائن خطأ موحد يمكن للواجهة التعامل معه
        return { ok: false, error: error.message || 'Network error or server is unreachable' };
    }
}

// --- واجهات المصادقة ---
async function apiRegister(userData) {
    return fetchApi('/api/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

async function apiLogin(credentials) {
    return fetchApi('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

// --- واجهات إدارة المستخدمين ---
async function apiGetUsers(page = 1, perPage = 10) {
    return fetchApi(`/admin/users?page=${page}&per_page=${perPage}`, { method: 'GET' });
}

async function apiGetUserDetails(userId) {
    return fetchApi(`/admin/users/${userId}`, { method: 'GET' });
}

async function apiUpdateUser(userId, userData) {
    // تأكد من إرسال البيانات المطلوبة فقط حسب الـ API
    const validData = { ...userData };
    // لا ترسل ID أو أي حقول غير قابلة للتعديل في الجسم
    delete validData.id;
    return fetchApi(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(validData),
    });
}

async function apiDeleteUser(userId) {
    // طريقة DELETE عادة لا تحتوي على جسم للطلب
    return fetchApi(`/admin/users/${userId}`, { method: 'DELETE' });
}

// --- واجهات إدارة المنشورات ---
async function apiCreatePost(postData) {
    // تأكد من إضافة user_id هنا إذا لم يكن مضافًا في الواجهة
    if (!postData.user_id) {
        postData.user_id = parseInt(getUserId()); // تأكد من أنه رقم
    }
     // إزالة حقل الصورة إذا كان فارغًا واختياريًا
     if (postData.image === '') {
        delete postData.image;
    }
    return fetchApi('/admin/posts/create', {
        method: 'POST',
        body: JSON.stringify(postData),
    });
}

async function apiGetPosts(page = 1, perPage = 10) {
    return fetchApi(`/admin/posts?page=${page}&per_page=${perPage}`, { method: 'GET' });
}

// ملاحظة: وثيقتك لا تذكر صراحة API للحصول على تفاصيل منشور واحد
// لكنها ضرورية لصفحة التعديل. نفترض وجودها (GET /admin/posts/{post_id})
async function apiGetPostDetails(postId) {
    // افترض وجود هذا المسار بناءً على نمط REST
    return fetchApi(`/admin/posts/${postId}`, { method: 'GET' });
}

async function apiUpdatePost(postId, postData) {
     // تأكد من إرسال البيانات المطلوبة فقط
     const validData = { ...postData };
     delete validData.id;
     delete validData.user_id; // عادة لا يُسمح بتغيير المؤلف
     delete validData.author;
     delete validData.created_at;
     // إزالة حقل الصورة إذا كان فارغًا ولكن الـ API تتطلب عدم إرساله فارغًا
     if (validData.image === '') {
        // قد تحتاج لإرسال null أو حذفه حسب تصميم الـ API
        delete validData.image;
     }
    return fetchApi(`/admin/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(validData),
    });
}

async function apiDeletePost(postId) {
    return fetchApi(`/admin/posts/${postId}`, { method: 'DELETE' });
}