const API_BASE_URL = 'http://localhost:7115/api';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return response.json();
};

const fetchCourseDetails = async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/Courses/${courseId}`, {
        method: 'GET',
    });
    return handleResponse(response);
};

const fetchUserEnrollment = async (courseId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Enrollments/${courseId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Nie udało się zapisać na kurs.');
    }
    return response.json().catch(() => ({ success: true }));
};

const fetchCourseProgress = async (courseId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Progress/course/${courseId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (response.status === 404) {
        return null;
    }
    
    return handleResponse(response);
};

const markLessonCompleted = async (lessonId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Progress/completeLesson/${lessonId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Nie udało się oznaczyć lekcji jako ukończonej.');
    }
    return response.json().catch(() => ({ success: true }));
};

const fetchLessonCompletion = async (lessonId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Progress/lesson/${lessonId}/completion`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
};

export {
    fetchCourseDetails,
    fetchLessonCompletion,
    markLessonCompleted,
    fetchUserEnrollment,
    fetchCourseProgress,
};