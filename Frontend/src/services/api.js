const API_BASE_URL = 'http://localhost:7115/api';

const getAuthToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    const currentToken = getAuthToken();

    if (!refreshToken || !currentToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentToken, refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data.token;
        } else {
            console.error("Refresh token expired or invalid");
            localStorage.clear();
            window.location.href = '/login';
            return null;
        }
    } catch (error) {
        console.error("Refresh request failed", error);
        localStorage.clear();
        window.location.href = '/login';
        return null;
    }
};

const authenticatedFetch = async (url, options = {}) => {
    let token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Jeśli wysyłamy pliki, usuwamy Content-Type, by przeglądarka ustawiła boundary
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            const newToken = await refreshAccessToken();
            
            if (newToken) {
                const newHeaders = {
                    ...headers,
                    'Authorization': `Bearer ${newToken}`
                };
                response = await fetch(url, { ...options, headers: newHeaders });
            } else {
                // Opcjonalnie: przekieruj do logowania, jeśli odświeżanie się nie uda
                throw new Error("Sesja wygasła. Zaloguj się ponownie.");
            }
        }

        return handleResponse(response);
    } catch (error) {
        throw error;
    }
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        // Rzucamy błąd, który będzie przechwycony przez catch w komponentach
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    // Obsługa statusu 204 No Content
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

// --- Auth (używane też w AuthContext, ale tutaj dla spójności) ---
const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) // Backend oczekuje 'email' lub 'username' w zależności od DTO
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

// --- Courses ---
const fetchCourseDetails = async (courseId) => {
    // GET /Courses/{id}
    return authenticatedFetch(`${API_BASE_URL}/Courses/${courseId}`, { method: 'GET' });
};

const fetchInstructorCourses = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Courses/instructor`, { method: 'GET' });
};

const searchCourses = async (query) => {
    const response = await fetch(`${API_BASE_URL}/Courses?search=${encodeURIComponent(query)}`);
    return handleResponse(response);
};

const deleteCourse = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Courses/${courseId}`, { method: 'DELETE' });
};

// --- Enrollments ---
const enrollInCourse = async (courseId) => {
    // Ważne: wysyłamy pusty obiekt JSON, aby Content-Type: application/json był poprawny dla ASP.NET
    return authenticatedFetch(`${API_BASE_URL}/Enrollments/${courseId}`, { 
        method: 'POST',
        body: JSON.stringify({}) 
    });
};

const fetchUserEnrollment = async (courseId) => {
    // GET /Enrollments/{id}/status
    return authenticatedFetch(`${API_BASE_URL}/Enrollments/${courseId}/status`, { method: 'GET' });
};

const fetchMyEnrollments = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Enrollments`, { method: 'GET' });
};

// --- Progress ---
const fetchCourseProgress = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}`, { method: 'GET' });
};

const fetchCompletedLessons = async (courseId) => {
    // Upewnij się, że ten endpoint istnieje w backendzie. 
    // Jeśli wcześniej działało axios.get(`/progress/course/${courseId}`), użyj krótszej ścieżki.
    // Tutaj zakładam, że zwraca listę obiektów, więc mapujemy na ID.
    const data = await authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}`, { method: 'GET' });
    return Array.isArray(data) ? data.map(p => p.lessonId) : [];
};

const fetchCompletedQuizzes = async (courseId) => {
    const data = await authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}/quizzes`, { method: 'GET' });
    return Array.isArray(data) ? data.map(q => q.quizId) : [];
};

const markLessonCompleted = async (lessonId) => {
    // FIX: Dodano puste body, aby POST był poprawny dla formatu JSON
    return authenticatedFetch(`${API_BASE_URL}/Progress/lesson/${lessonId}`, { 
        method: 'POST',
        body: JSON.stringify({})
    });
};

const fetchLessonCompletion = async (lessonId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/lesson/${lessonId}/completion`, { method: 'GET' });
};

// --- Quizzes ---
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

// --- Comments / Discussion ---
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

// --- Files ---
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // authenticatedFetch usunie Content-Type dla FormData
    return authenticatedFetch(`${API_BASE_URL}/Upload`, {
        method: 'POST',
        body: formData
    });
};

// --- Certificates ---
const downloadCertificate = async (courseId) => {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/Certificates/${courseId}/download`, {
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

// --- Notifications ---
const fetchNotifications = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Notifications`, { method: 'GET' });
};

const markNotificationRead = async (id) => {
    return authenticatedFetch(`${API_BASE_URL}/Notifications/${id}/read`, { method: 'PUT' });
};

// Nowa funkcja do zgłaszania błędów (wymaga endpointu POST w backendzie)
const createNotification = async (notificationData) => {
    return authenticatedFetch(`${API_BASE_URL}/Notifications`, {
        method: 'POST',
        body: JSON.stringify(notificationData)
    });
};

// --- Analytics & Reviews ---
const fetchCourseAnalytics = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Analytics/course/${courseId}`, { method: 'GET' });
};

const createReview = async (courseId, rating, content) => {
    // Mapujemy 'content' na to co oczekuje backend (np. 'comment' lub 'reviewText')
    return authenticatedFetch(`${API_BASE_URL}/Reviews`, {
        method: 'POST',
        body: JSON.stringify({ courseId, rating, comment: content }) 
    });
};

const fetchCourseReviews = async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/Reviews/course/${courseId}`);
    return handleResponse(response);
};

// --- Gamification ---
const fetchLeaderboard = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Gamification/leaderboard`, { method: 'GET' });
};

const fetchMyStats = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Gamification/my-stats`, { method: 'GET' });
};

// --- Notes ---
const fetchUserNote = async (lessonId) => {
    return authenticatedFetch(`${API_BASE_URL}/Notes/lesson/${lessonId}`, { method: 'GET' });
};

const saveUserNote = async (lessonId, content, title) => {
    return authenticatedFetch(`${API_BASE_URL}/Notes`, {
        method: 'POST',
        body: JSON.stringify({ lessonId, content, title })
    });
};

export {
    loginUser,
    registerUser,
    fetchCourseDetails,
    fetchInstructorCourses, 
    deleteCourse,           
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
    submitDailyReview
};