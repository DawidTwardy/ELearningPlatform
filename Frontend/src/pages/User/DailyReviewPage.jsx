import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDailyReview, submitDailyReview } from '../../services/api';
import '../../styles/pages/QuizView.css';

const DailyReviewPage = () => {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const data = await fetchDailyReview();
                if (data && data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                } else {
                    setQuestions([]);
                }
            } catch (err) {
                console.error(err);
                setError("Nie udało się pobrać pytań do powtórki.");
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, []);

    const handleAnswerChange = (questionId, answerOptionId) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answerOptionId
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(userAnswers).length < questions.length) {
            alert("Proszę odpowiedzieć na wszystkie pytania.");
            return;
        }

        setLoading(true);
        
        const answersPayload = Object.entries(userAnswers).map(([qId, aId]) => ({
            questionId: parseInt(qId),
            answerOptionId: parseInt(aId)
        }));

        try {
            const data = await submitDailyReview(answersPayload);
            setResult(data);
        } catch (err) {
            console.error(err);
            alert("Błąd wysyłania odpowiedzi.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="quiz-view-container">Ładowanie...</div>;
    if (error) return <div className="quiz-view-container">{error}</div>;

    if (questions.length === 0) {
        return (
            <div className="quiz-view-container" style={{textAlign: 'center'}}>
                <h2 style={{color: '#fff'}}>Codzienna Powtórka</h2>
                <p style={{color: '#aaa'}}>Brak pytań na dziś. Ukończ więcej lekcji lub kursów, aby odblokować powtórki.</p>
                <button className="back-button" onClick={() => navigate('/')}>Wróć na stronę główną</button>
            </div>
        );
    }

    if (result) {
        return (
            <div className="quiz-view-container result-view">
                <h2 style={{ color: '#fff' }}>Wynik Powtórki</h2>
                
                <div className={`result-box passed`} style={{
                    padding: '30px', 
                    backgroundColor: '#1E1E1E',
                    border: '2px solid #4CAF50',
                    borderRadius: '12px',
                    marginTop: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '3em', margin: '10px 0' }}>{result.score} / {result.maxScore}</h1>
                    <p style={{ fontSize: '1.2em', color: '#aaa' }}>Poprawne odpowiedzi</p>
                    
                    {result.score > 0 && (
                        <div style={{ marginTop: '20px', color: '#f3b421', fontWeight: 'bold' }}>
                            + {result.score * 5} punktów doświadczenia!
                        </div>
                    )}
                </div>

                <button 
                    className="rate-course-button" 
                    style={{ marginTop: '30px' }}
                    onClick={() => navigate('/')}
                >
                    Wróć do nauki
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="quiz-view-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>Codzienna Powtórka</h1>
                <span style={{ color: '#aaa' }}>Pytanie {currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            
            <div className="question-block" style={{ marginBottom: '30px', background: '#2a2a2a', padding: '20px', borderRadius: '8px', minHeight: '200px' }}>
                <h3 style={{ color: '#ddd', marginTop: 0, fontSize: '20px' }}>{currentQuestion.text}</h3>
                <div className="answer-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {currentQuestion.options.map((opt) => {
                        const isSelected = userAnswers[currentQuestion.questionId] === opt.answerOptionId;
                        
                        return (
                            <label 
                                key={opt.answerOptionId} 
                                className={`answer-option-label ${isSelected ? 'selected' : ''}`}
                                style={{
                                    padding: '15px',
                                    background: isSelected ? '#444' : '#333',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#fff',
                                    transition: 'all 0.2s',
                                    border: isSelected ? '1px solid #fff' : '1px solid #444'
                                }}
                            >
                                <input
                                    type="radio"
                                    name={`q-${currentQuestion.questionId}`}
                                    value={opt.answerOptionId}
                                    checked={isSelected}
                                    onChange={() => handleAnswerChange(currentQuestion.questionId, opt.answerOptionId)}
                                    style={{ marginRight: '15px', transform: 'scale(1.2)', cursor: 'pointer' }}
                                />
                                {opt.text}
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="quiz-navigation" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button 
                    onClick={handlePrev}
                    className="back-button"
                    disabled={currentQuestionIndex === 0}
                    style={{ width: 'auto', padding: '10px 20px', opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                >
                    Poprzednie
                </button>

                {isLastQuestion ? (
                    <button 
                        onClick={handleSubmit} 
                        className="rate-course-button"
                        style={{ width: 'auto', padding: '10px 30px' }}
                    >
                        Zakończ Powtórkę
                    </button>
                ) : (
                    <button 
                        onClick={handleNext} 
                        className="rate-course-button"
                        style={{ width: 'auto', padding: '10px 30px' }}
                    >
                        Następne
                    </button>
                )}
            </div>
        </div>
    );
};

export default DailyReviewPage;