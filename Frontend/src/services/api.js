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

const fetchCompletedLessons = async (courseId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Progress/course/${courseId}/completed-lessons`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
};

const fetchCompletedQuizzes = async (courseId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Progress/course/${courseId}/completed-quizzes`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
};

const markLessonCompleted = async (lessonId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Progress/lesson/${lessonId}/complete`, {
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

const fetchComments = async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/Comments/course/${courseId}`, {
        method: 'GET',
    });
    return handleResponse(response);
};

const createComment = async (courseId, content, parentCommentId = null) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Comments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, content, parentCommentId })
    });
    return handleResponse(response);
};

const updateComment = async (commentId, content) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Comments/${commentId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
    });
    if (!response.ok) {
        throw new Error('Błąd podczas edycji');
    }
    return true;
};

const deleteComment = async (commentId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!response.ok) {
        throw new Error('Błąd podczas usuwania');
    }
    return true;
};

const fetchMyEnrollments = async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Enrollments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
};

const uploadFile = async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/Upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });

    return handleResponse(response);
};

const downloadCertificate = async (courseId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/Certificates/${courseId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
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

export {
    fetchCourseDetails,
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
    downloadCertificate
};