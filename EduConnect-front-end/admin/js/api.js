// تأكد من وجود API_BASE_URL (يمكن استيراده أو تعريفه هنا إذا لزم الأمر)
//const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function fetchApi(endpoint, options = {}, authRequired = true) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (authRequired && token && !endpoint.startsWith('/login') && !endpoint.startsWith('/register')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: headers,
        });

        if (response.status === 204) {
            return { ok: true, data: { message: "Operation successful (No Content)" } };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        }

        return { ok: true, data };

    } catch (error) {
        console.error(`API call failed: ${error.message}`, error);
        return { ok: false, error: error.message || 'Network error or server is unreachable' };
    }
}


// --- واجهات المصادقة ---
async function apiRegister(userData) {
    return fetchApi('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }, false); // لا يحتاج توكن
}

async function apiLogin(credentials) {
    return fetchApi('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }, false); // لا يحتاج توكن
}

// --- واجهات إدارة المستخدمين ---
async function apiGetUsers(page = 1, perPage = 10) {
    return fetchApi(`/admin/users?page=${page}&per_page=${perPage}`, { method: 'GET' });
}

async function apiGetUserDetails(userId) {
    return fetchApi(`/admin/users/${userId}`, { method: 'GET' }, false); // بدون توكن
}

async function apiUpdateUser(userId, userData) {
    const validData = { ...userData };
    delete validData.id;
    return fetchApi(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(validData),
    });
}

async function apiDeleteUser(userId) {
    return fetchApi(`/admin/users/${userId}`, { method: 'DELETE' });
}


// --- واجهات إدارة المنشورات ---
async function apiCreatePost(postData) {
    if (!postData.user_id) {
        postData.user_id = parseInt(getUserId());
    }

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

async function apiGetPostDetails(postId) {
    return fetchApi(`/posts/public/${postId}`, { method: 'GET' },false);
}

async function apiUpdatePost(postId, postData) {
    const validData = { ...postData };
    delete validData.id;
    delete validData.user_id;
    delete validData.author;
    delete validData.created_at;

    if (validData.image === '') {
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

async function apiGetPostDetails(postId) {

    try {
        const response = await fetch(`/api/posts/public/${postId}`, { method: 'GET' }, false);
        const text = await response.text();

        try {
            const json = JSON.parse(text);
            return { ok: response.ok, data: json };
        } catch (err) {
            return { ok: false, error: 'الرد ليس JSON صالحًا', raw: text };
        }
    } catch (error) {
        return { ok: false, error: error.message };
    }
}
async function apiGetPostComments(postId) {
    return fetchApi(`/posts/${postId}/comments`, { method: 'GET' });
}
async function apiCreateComment(postId, commentData) {
    return fetchApi(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
    });
}
async function apiUpdateComment(postId, commentId, commentData) {
    return fetchApi(`/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify(commentData),
    });
}
async function apiDeleteComment(postId, commentId) {
    return fetchApi(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
}

async function apiGetPostLikes(postId) {
    return fetchApi(`/posts/${postId}/likes`, { method: 'GET' });
}

async function apiLikePost(postId) {
    return fetchApi(`/posts/${postId}/likes`, {
        method: 'POST',
    });
}

async function apiUnlikePost(postId) {
    return fetchApi(`/posts/${postId}/likes`, {
        method: 'DELETE',
    });
}
