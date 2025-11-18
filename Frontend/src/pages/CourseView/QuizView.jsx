import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Zakładam, że masz AuthContext

// Zmienna dla łatwego zarządzania adresem API
const API_BASE_URL = 'https://localhost:7001/api/quizzes'; // Użyj poprawnego adresu URL (HTTPS lub HTTP)

const QuizView = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); // Zakładam, że używasz tego do weryfikacji

    const [quizData, setQuizData] = useState(null); 
    // Przechowujemy odpowiedzi w formacie { QuestionId: AnswerOptionId }
    const [userAnswers, setUserAnswers] = useState({}); 
    const [result, setResult] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pobieranie danych quizu
    const fetchQuiz = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch(`${API_BASE_URL}/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 404) {
                 setError('Quiz o podanym ID nie istnieje lub nie ma danych.');
                 setLoading(false);
                 return;
            }

            if (!response.ok) {
                // To wyłapie 401 Unauthorized (brak tokena) lub 500 Internal Server Error
                throw new Error(`Błąd serwera: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setQuizData(data);
            setLoading(false);
        } catch (err) {
            console.error("Błąd podczas pobierania quizu:", err);
            setError(`Wystąpił błąd sieci lub serwera. Sprawdź, czy backend działa. (${err.message})`);
            setLoading(false);
        }
    }, [quizId, isAuthenticated]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    // Obsługa zmiany odpowiedzi (użycie QuestionId i AnswerOptionId)
    const handleAnswerChange = (questionId, answerOptionId) => {
        // Konwersja na liczby całkowite, ponieważ QuestionId i AnswerOptionId są intami w DTO
        const qId = parseInt(questionId);
        const aId = parseInt(answerOptionId);

        setUserAnswers(prevAnswers => ({
            ...prevAnswers,
            [qId]: aId,
        }));
    };

    // Obsługa przesyłania quizu
    const handleSubmitQuiz = async () => {
        if (Object.keys(userAnswers).length !== quizData.questions.length) {
            alert("Musisz odpowiedzieć na wszystkie pytania przed zakończeniem.");
            return;
        }

        setLoading(true);
        setError(null);

        // Mapowanie stanu userAnswers na strukturę SubmitQuizDto
        const submitDto = {
            quizId: parseInt(quizId),
            answers: Object.entries(userAnswers).map(([questionId, answerOptionId]) => ({
                // Klucze DTO z backendu: QuestionId, AnswerOptionId
                questionId: parseInt(questionId), 
                answerOptionId: parseInt(answerOptionId),
            })),
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitDto),
            });

            if (!response.ok) {
                throw new Error(`Błąd serwera: ${response.status} ${response.statusText}`);
            }
            
            const resultData = await response.json();
            setResult(resultData); 
            setQuizData(null); // Ukrycie pytań
            setLoading(false);
        } catch (err) {
            console.error("Błąd podczas przesyłania quizu:", err);
            setError(`Wystąpił błąd sieci lub serwera. Sprawdź, czy backend działa. (${err.message})`);
            setLoading(false);
        }
    };

    if (loading && !error) return <div className="quiz-view-container">Ładowanie quizu...</div>;
    if (error) return <div className="quiz-view-container error">Błąd: {error}</div>;

    // Wyświetlanie wyniku po przesłaniu
    if (result) {
        return (
            <div className="quiz-view-container result-view">
                <h2>Wynik Quizu: {quizData?.title || 'Quiz'}</h2>
                <p>Twój wynik: {result.score} / {result.maxScore}</p>
                <p className={result.isPassed ? 'passed' : 'failed'}>
                    Status: {result.isPassed ? 'ZALICZONY 🎉' : 'NIEZALICZONY 😔'}
                </p>
                <p>Liczba prób: {result.attemptsCount}</p>
                {/* Załóżmy, że potrzebujesz sectionId do powrotu do widoku kursu */}
                <button onClick={() => navigate(`/course-view/${quizData?.sectionId || 'default'}/content`)}>Wróć do kursu</button> 
            </div>
        );
    }

    // Wyświetlanie pytań quizu
    return (
        <div className="quiz-view-container">
            <h1>{quizData.title}</h1>
            
            {quizData.questions.map((question, qIndex) => (
                <div key={question.questionId} className="question-block">
                    {/* Ważne: używamy .questionId i .options z DTO */}
                    <h3>{qIndex + 1}. {question.text}</h3>
                    <div className="answer-options">
                        {question.options.map(option => (
                            <label key={option.answerOptionId} className="answer-option-label">
                                <input
                                    type="radio"
                                    name={`question-${question.questionId}`}
                                    value={option.answerOptionId}
                                    // Używamy .questionId i .answerOptionId
                                    checked={userAnswers[question.questionId] === option.answerOptionId}
                                    onChange={() => handleAnswerChange(question.questionId, option.answerOptionId)}
                                />
                                {option.text}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            
            <button 
                onClick={handleSubmitQuiz} 
                disabled={loading || Object.keys(userAnswers).length !== quizData.questions.length}
                className="submit-quiz-button"
            >
                {loading ? 'Przesyłanie...' : 'Zakończ i sprawdź wynik'}
            </button>
        </div>
    );
};

export default QuizView;