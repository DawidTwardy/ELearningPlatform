import React, { useState } from 'react';
import '../../styles/pages/QuizView.css'; 

const API_BASE_URL = 'http://localhost:7115/api/quizzes';

const QuizView = ({ quiz, courseId }) => {
    if (!quiz) return <div className="quiz-view-container">Brak danych quizu.</div>;

    const quizId = quiz.id || quiz.Id;
    const title = quiz.title || quiz.Title;
    const questions = quiz.questions || quiz.Questions || [];

    const [userAnswers, setUserAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnswerChange = (questionIndex, answerOptionId) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionIndex]: answerOptionId
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
            alert("Proszę odpowiedzieć na wszystkie pytania przed zakończeniem.");
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        const submitDto = {
            quizId: quizId,
            answers: Object.entries(userAnswers).map(([qIndex, aId]) => {
                const question = questions[parseInt(qIndex)];
                const qId = question.id || question.Id || question.questionId || question.QuestionId;
                return {
                    questionId: parseInt(qId),
                    answerOptionId: parseInt(aId)
                };
            })
        };

        try {
            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitDto)
            });

            if (!response.ok) {
                throw new Error('Błąd podczas przesyłania odpowiedzi.');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('Nie udało się przesłać quizu. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="quiz-view-container result-view">
                <h2 style={{ color: '#fff' }}>Wynik: {title}</h2>
                
                <div className={`result-box ${result.isPassed ? 'passed' : 'failed'}`} style={{
                    padding: '20px', 
                    backgroundColor: result.isPassed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    border: result.isPassed ? '1px solid #4caf50' : '1px solid #f44336',
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <h3 style={{ marginTop: 0 }}>
                        {result.isPassed ? '🎉 Gratulacje! Zdałeś!' : '😔 Niestety, nie udało się.'}
                    </h3>
                    <p style={{ fontSize: '18px' }}>Twój wynik: <strong>{result.score} / {result.maxScore}</strong></p>
                    <p>Podejście numer: {result.attemptsCount}</p>
                </div>

                <button 
                    className="rate-course-button" 
                    style={{ marginTop: '20px' }}
                    onClick={() => { setResult(null); setUserAnswers({}); setCurrentQuestionIndex(0); }}
                >
                    Spróbuj ponownie
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const qText = currentQuestion.text || currentQuestion.Text;
    const options = currentQuestion.options || currentQuestion.Options || [];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="quiz-view-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>{title}</h1>
                <span style={{ color: '#aaa' }}>Pytanie {currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            
            <div className="question-block" style={{ marginBottom: '30px', background: '#2a2a2a', padding: '20px', borderRadius: '8px', minHeight: '200px' }}>
                <h3 style={{ color: '#ddd', marginTop: 0, fontSize: '20px' }}>{qText}</h3>
                <div className="answer-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {options.map((opt, index) => {
                        const optId = opt.id || opt.Id || opt.answerOptionId || opt.AnswerOptionId;
                        const optText = opt.text || opt.Text;
                        const isSelected = userAnswers[currentQuestionIndex] === optId;
                        const uniqueKey = optId || `opt-${index}`;

                        return (
                            <label 
                                key={uniqueKey} 
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
                                    border: isSelected ? '1px solid #fff' : '1px solid #444',
                                    boxShadow: isSelected ? '0 0 5px rgba(255,255,255,0.2)' : 'none'
                                }}
                            >
                                <input
                                    type="radio"
                                    name={`q-index-${currentQuestionIndex}`}
                                    value={optId}
                                    checked={isSelected}
                                    onChange={() => handleAnswerChange(currentQuestionIndex, optId)}
                                    style={{ marginRight: '15px', transform: 'scale(1.2)', cursor: 'pointer' }}
                                />
                                {optText}
                            </label>
                        );
                    })}
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="quiz-navigation" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button 
                    onClick={handlePrev}
                    className="back-button"
                    disabled={currentQuestionIndex === 0}
                    style={{ 
                        width: 'auto', 
                        padding: '10px 20px', 
                        opacity: currentQuestionIndex === 0 ? 0.5 : 1,
                        cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Poprzednie
                </button>

                {isLastQuestion ? (
                    <button 
                        onClick={handleSubmit} 
                        className="rate-course-button"
                        disabled={loading}
                        style={{ width: 'auto', padding: '10px 30px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Przesyłanie...' : 'Zakończ Quiz'}
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

export default QuizView;