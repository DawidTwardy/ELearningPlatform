const API_BASE_URL = 'http://localhost:7115/api';

const getAuthToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');

// Funkcja pomocnicza do odświeżania tokena
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
            // Refresh nieudany - wyloguj
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

// Wrapper dla fetch, który automatycznie dodaje token i obsługuje refresh
const authenticatedFetch = async (url, options = {}) => {
    let token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Usuń Content-Type jeśli wysyłamy FormData (np. upload plików)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        let response = await fetch(url, { ...options, headers });

        // Jeśli otrzymamy 401 (Unauthorized), próbujemy odświeżyć token
        if (response.status === 401) {
            const newToken = await refreshAccessToken();
            
            if (newToken) {
                // Ponawiamy zapytanie z nowym tokenem
                const newHeaders = {
                    ...headers,
                    'Authorization': `Bearer ${newToken}`
                };
                response = await fetch(url, { ...options, headers: newHeaders });
            } else {
                // Nie udało się odświeżyć -> rzucamy błąd
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
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

// --- FUNKCJE API ---

const fetchCourseDetails = async (courseId) => {
    // Publiczny endpoint - zwykły fetch
    const response = await fetch(`${API_BASE_URL}/Courses/${courseId}`);
    return handleResponse(response);
};

const fetchInstructorCourses = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Courses/my-courses`, { method: 'GET' });
};

const deleteCourse = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Courses/${courseId}`, { method: 'DELETE' });
};

const fetchUserEnrollment = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Enrollments/${courseId}`, { method: 'POST' });
};

const fetchCourseProgress = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}`, { method: 'GET' });
};

const fetchCompletedLessons = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}/completed-lessons`, { method: 'GET' });
};

const fetchCompletedQuizzes = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/course/${courseId}/completed-quizzes`, { method: 'GET' });
};

const markLessonCompleted = async (lessonId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/lesson/${lessonId}/complete`, { method: 'POST' });
};

const fetchLessonCompletion = async (lessonId) => {
    return authenticatedFetch(`${API_BASE_URL}/Progress/lesson/${lessonId}/completion`, { method: 'GET' });
};

const fetchComments = async (courseId) => {
    // Komentarze mogą być publiczne, ale w tym systemie są dostępne
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

const fetchMyEnrollments = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Enrollments`, { method: 'GET' });
};

const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // authenticatedFetch obsłuży usunięcie Content-Type dla FormData
    return authenticatedFetch(`${API_BASE_URL}/Upload`, {
        method: 'POST',
        body: formData
    });
};

const downloadCertificate = async (courseId) => {
    const token = getAuthToken();
    // Pobieranie plików to specyficzny przypadek, trudniejszy do obsłużenia przez wrapper JSON.
    // Tutaj używamy bezpośredniego fetch z ewentualną logiką odświeżania "ręcznie" lub zakładamy że token jest ważny.
    // Dla uproszczenia: standardowy fetch z tokenem.
    
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

const fetchNotifications = async () => {
    return authenticatedFetch(`${API_BASE_URL}/Notifications`, { method: 'GET' });
};

const markNotificationRead = async (id) => {
    return authenticatedFetch(`${API_BASE_URL}/Notifications/${id}/read`, { method: 'PUT' });
};

const fetchCourseAnalytics = async (courseId) => {
    return authenticatedFetch(`${API_BASE_URL}/Analytics/course/${courseId}`, { method: 'GET' });
};

const createReview = async (courseId, rating, content) => {
    return authenticatedFetch(`${API_BASE_URL}/Reviews`, {
        method: 'POST',
        body: JSON.stringify({ courseId, rating, content })
    });
};

const fetchCourseReviews = async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/Reviews/course/${courseId}`);
    return handleResponse(response);
};

export {
    fetchCourseDetails,
    fetchInstructorCourses, 
    deleteCourse,           
    fetchLessonCompletion,
    markLessonCompleted,
    fetchUserEnrollment,
    fetchCourseProgress,
    fetchCompletedLessons, 
    fetchCompletedQuizzes,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    fetchMyEnrollments,
    uploadFile,
    downloadCertificate,
    fetchNotifications,
    markNotificationRead,
    fetchCourseAnalytics,
    createReview,
    fetchCourseReviews
};