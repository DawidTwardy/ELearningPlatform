import axios from 'axios';

const API_BASE_URL = 'http://localhost:7115/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
};

const getRefreshToken = () => {
    const token = localStorage.getItem('refreshToken');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
};

const resolveImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('blob:')) return path;
    
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    
    return `${serverUrl}/${cleanPath}`;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
    return new Promise(() => {});
};

const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    const currentToken = getAuthToken();

    if (!refreshToken) {
        return logout();
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentToken || "", refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                return data.token;
            }
        }
        
        return logout();
    } catch (error) {
        return logout();
    }
};

const authenticatedFetch = async (url, options = {}) => {
    let token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            if (isRefreshing) {
                try {
                    const newToken = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    
                    headers['Authorization'] = `Bearer ${newToken}`;
                    return await fetch(url, { ...options, headers }).then(handleResponse);
                } catch (err) {
                    throw err;
                }
            }

            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                processQueue(null, newToken);
                headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, { ...options, headers });
                
                if (response.status === 401) {
                     return logout();
                }
            } catch (error) {
                processQueue(error, null);
                throw error;
            } finally {
                isRefreshing = false;
            }
        }

        return handleResponse(response);
    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
             throw new Error("Błąd połączenia z serwerem. Sprawdź swoje połączenie internetowe.");
        }
        throw error;
    }
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData = { message: response.statusText };

        if (contentType && contentType.includes("application/json")) {
            errorData = await response.json().catch(() => ({ message: response.statusText }));
        } else {
             const text = await response.text();
             errorData.message = text || response.statusText;
        }

        let errorMessage = errorData.message || `API Error: ${response.status}`;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join('; ');
        } else if (errorData.errors) {
            errorMessage = Object.values(errorData.errors).flat().join('; ');
        }
        
        throw new Error(errorMessage || `API Error: ${response.status}`);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
};

const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return handleResponse(response);
};

const createCourseReport = async (courseId, reason) => {
    return authenticatedFetch(`${API_BASE_URL}/Reports/Course`, {
        method: 'POST',
        body: JSON.stringify({ courseId, reason })
    });
};

const createCommentReport = async (commentId, reason) => {
    return authenticatedFetch(`${API_BASE_URL}/Reports/Comment`, {
        method: 'POST',
        body: JSON.stringify({ commentId, reason })
    });
};

const fetchCourseReports = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Reports/course/${courseId}`, { method: 'GET' });
};

const deleteCourseReport = async (reportId) => {
    return authenticatedFetch(`${API_BASE_URL}/Reports/${reportId}`, { method: 'DELETE' });
};

const resolveCourseReport = async (reportId) => {
    return authenticatedFetch(`${API_BASE_URL}/Reports/${reportId}/resolve`, { method: 'PUT' });
};

const fetchCourseDetails = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Courses/${courseId}`, { method: 'GET' });
};

const fetchInstructorCourses = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Courses/my-courses`, { method: 'GET' });
};

const searchCourses = async (query) => {
    const response = await fetch(`${API_BASE_URL}/Courses?search=${encodeURIComponent(query)}`);
    return handleResponse(response);
};

const deleteCourse = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Courses/${courseId}`, { method: 'DELETE' });
};

const updateCourse = async (id, courseData) => {
    return authenticatedFetch(`${API_BASE_URL}/Courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData)
    });
};

const enrollInCourse = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Enrollments/${courseId}`, { 
        method: 'POST',
        body: JSON.stringify({}) 
    });
};

const fetchUserEnrollment = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Enrollments/${courseId}/status`, { method: 'GET' });
};

const fetchMyEnrollments = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Enrollments`, { method: 'GET' });
};

const fetchCourseProgress = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}`, { method: 'GET' });
};

const fetchCompletedLessons = async (courseId) => {
    const data = await authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}/completed-lessons`, { method: 'GET' });
    return Array.isArray(data) ? data : [];
};

const fetchCompletedQuizzes = async (courseId) => {
    const data = await authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}/completed-quizzes`, { method: 'GET' });
    return Array.isArray(data) ? data : [];
};

const markLessonCompleted = async (lessonId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/lesson/${lessonId}/complete`, { 
        method: 'POST',
        body: JSON.stringify({})
    });
};

const fetchLessonCompletion = async (lessonId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/lesson/${lessonId}/completion`, { method: 'GET' });
};

const submitQuiz = async (quizId, answers) => {
    return authenticatedFetch(`${API_BASE_URL}/Quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
    });
};

const fetchDailyReview = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Quizzes/daily`, { method: 'GET' });
};

const submitDailyReview = async (answers) => {
    return authenticatedFetch(`${API_BASE_URL}/Quizzes/daily/submit`, {
        method: 'POST',
        body: JSON.stringify(answers)
    });
};

const fetchComments = async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/Comments/course/${courseId}`);
    return handleResponse(response);
};

const createComment = async (courseId, content, parentCommentId = null) => {
    return authenticatedFetch(`${API_BASE_URL}/Comments`, {
        method: 'POST',
        body: JSON.stringify({ courseId, content, parentCommentId })
    });
};

const updateComment = async (commentId, content) => {
    return authenticatedFetch(`${API_BASE_URL}/Comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
    });
};

const deleteComment = async (commentId) => {
    return authenticatedFetch(`${API_BASE_URL}/Comments/${commentId}`, { method: 'DELETE' });
};

const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return authenticatedFetch(`${API_BASE_URL}/Upload`, {
        method: 'POST',
        body: formData
    });
};

const uploadFileWithProgress = (file, onProgress) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/Upload`, true);
        
        const token = getAuthToken();
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percentComplete = (event.loaded / event.total) * 100;
                onProgress(percentComplete, event.loaded, event.total);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    resolve(null);
                }
            } else {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
    });
};

const updateUserProfile = async (profileData) => {
    return authenticatedFetch(`${API_BASE_URL}/Profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
};

const fetchUserProfile = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Profile`, {
        method: 'GET'
    });
};

const downloadCertificate = async (courseId) => {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/Certificates/${courseId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Nie udało się pobrać certyfikatu.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certyfikat_Kurs_${courseId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

const verifyCertificate = async (certificateId) => {
    const response = await fetch(`${API_BASE_URL}/Certificates/verify/${certificateId}`);
    return handleResponse(response);
};

const fetchNotifications = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Notifications`, { method: 'GET' });
};

const markNotificationRead = async (id) => {
    return authenticatedFetch(`${API_BASE_URL}/Notifications/${id}/read`, { method: 'PUT' });
};

const createNotification = async (notificationData) => {
    return authenticatedFetch(`${API_BASE_URL}/Notifications`, {
        method: 'POST',
        body: JSON.stringify(notificationData)
    });
};

const fetchCourseAnalytics = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Analytics/course/${encodeURIComponent(courseId)}`, { method: 'GET' });
};

const createReview = async (courseId, rating, content) => {
    return authenticatedFetch(`${API_BASE_URL}/Reviews`, {
        method: 'POST',
        body: JSON.stringify({ courseId, rating, comment: content }) 
    });
};

const fetchCourseReviews = async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/Reviews/course/${courseId}`);
    return handleResponse(response);
};

const fetchLeaderboard = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Gamification/leaderboard`, { method: 'GET' });
};

const fetchMyStats = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Gamification/my-stats`, { method: 'GET' });
};

const fetchUserNote = async (lessonId) => {
    return authenticatedFetch(`${API_BASE_URL}/Notes/lesson/${lessonId}`, { method: 'GET' });
};

const saveUserNote = async (lessonId, content, title) => {
    return authenticatedFetch(`${API_BASE_URL}/Notes`, {
        method: 'POST',
        body: JSON.stringify({ lessonId, content, title })
    });
};

const fetchInstructors = async () => {
    const response = await fetch(`${API_BASE_URL}/Instructors`);
    return handleResponse(response);
};

const fetchInstructorDetails = async (instructorId) => {
    const response = await fetch(`${API_BASE_URL}/Instructors/${instructorId}`);
    return handleResponse(response);
};

const fetchReportedCourses = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Admin/reported-courses`, { method: 'GET' });
};

const ignoreCourseReport = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Admin/courses/${courseId}/ignore-report`, { 
        method: 'POST',
        body: JSON.stringify({})
    });
};

const deleteReportedCourse = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Admin/courses/${courseId}`, { method: 'DELETE' });
};

const fetchReportedComments = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Admin/reported-comments`, { method: 'GET' });
};

const keepComment = async (commentId) => {
    return authenticatedFetch(`${API_BASE_URL}/Admin/comments/${commentId}/keep`, { 
        method: 'POST',
        body: JSON.stringify({})
    });
};

const deleteReportedComment = async (commentId) => {
    return authenticatedFetch(`${API_BASE_URL}/Admin/comments/${commentId}`, { method: 'DELETE' });
};

export {
    loginUser,
    registerUser,
    fetchCourseDetails,
    fetchInstructorCourses, 
    deleteCourse,
    updateCourse,
    fetchLessonCompletion,
    markLessonCompleted,
    enrollInCourse,
    fetchUserEnrollment,
    fetchCourseProgress,
    fetchCompletedLessons, 
    fetchCompletedQuizzes,
    submitQuiz,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    fetchMyEnrollments,
    uploadFile,
    uploadFileWithProgress,
    updateUserProfile,
    fetchUserProfile,
    downloadCertificate,
    fetchNotifications,
    markNotificationRead,
    createNotification,
    fetchCourseAnalytics,
    createReview,
    fetchCourseReviews,
    fetchLeaderboard,
    fetchMyStats,
    fetchUserNote,
    saveUserNote,
    searchCourses,
    verifyCertificate,
    fetchDailyReview,
    submitDailyReview,
    fetchInstructors,
    fetchInstructorDetails,
    resolveImageUrl, 
    fetchReportedCourses,
    ignoreCourseReport,
    deleteReportedCourse,
    fetchReportedComments,
    keepComment,
    deleteReportedComment,
    createCourseReport,
    createCommentReport,
    fetchCourseReports,
    deleteCourseReport,
    resolveCourseReport,
    API_BASE_URL,
    api
};

export default api;