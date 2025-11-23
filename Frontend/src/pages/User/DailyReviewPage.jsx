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

    if (loading) return <div className="quiz-view-container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>Ładowanie...</div>;
    if (error) return <div className="quiz-view-container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>{error}</div>;

    if (questions.length === 0) {
        return (
            <div className="quiz-view-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', width: '100%' }}>
                    <h2 style={{ color: '#fff' }}>Codzienna Powtórka</h2>
                    <p style={{ color: '#aaa', marginBottom: '30px' }}>Brak pytań na dziś. Ukończ więcej lekcji lub kursów, aby odblokować powtórki.</p>
                    <button className="back-button" onClick={() => navigate('/')} style={{ margin: '0 auto', display: 'block' }}>Wróć na stronę główną</button>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="quiz-view-container" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 'calc(100vh - 100px)',
                width: '100%'
            }}>
                <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                    <h2 style={{ color: '#fff', marginBottom: '30px' }}>Wynik Powtórki</h2>
                    
                    <div className={`result-box passed`} style={{
                        padding: '40px', 
                        backgroundColor: '#1E1E1E',
                        border: '2px solid #4CAF50',
                        borderRadius: '12px',
                        marginBottom: '40px',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <h1 style={{ fontSize: '4em', margin: '0 0 15px 0', color: '#fff' }}>{result.score} / {result.maxScore}</h1>
                        <p style={{ fontSize: '1.2em', color: '#aaa', margin: 0 }}>Poprawne odpowiedzi</p>
                        
                        {result.score > 0 && (
                            <div style={{ marginTop: '25px', color: '#f3b421', fontWeight: 'bold', fontSize: '1.3em' }}>
                                + {result.score * 5} punktów doświadczenia!
                            </div>
                        )}
                    </div>

                    <button 
                        className="rate-course-button" 
                        style={{ 
                            marginTop: '0', 
                            width: '100%', 
                            padding: '15px 30px',
                            fontSize: '1.1em'
                        }}
                        onClick={() => navigate('/')}
                    >
                        Wróć do nauki
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="quiz-view-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', minHeight: 'calc(100vh - 100px)' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>Codzienna Powtórka</h1>
                    <span style={{ color: '#aaa' }}>Pytanie {currentQuestionIndex + 1} / {questions.length}</span>
                </div>
                
                {/* BELKA Z NAZWĄ KURSU I LEKCJI */}
                <div style={{ 
                    marginBottom: '20px', 
                    padding: '12px 20px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    borderLeft: '4px solid #28A745',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ddd'
                }}>
                    <span style={{ color: '#aaa' }}>Źródło:</span>
                    <strong style={{ color: '#fff' }}>{currentQuestion.courseTitle}</strong>
                    <span style={{ color: '#666' }}>/</span>
                    <span>{currentQuestion.sectionTitle}</span>
                </div>

                <div className="question-block" style={{ marginBottom: '30px', background: '#2a2a2a', padding: '30px', borderRadius: '12px', minHeight: '200px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '30px', fontSize: '1.4em', lineHeight: '1.5' }}>{currentQuestion.text}</h3>
                    
                    <div className="answer-options" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {currentQuestion.options.map((opt) => {
                            const isSelected = userAnswers[currentQuestion.questionId] === opt.answerOptionId;
                            
                            return (
                                <label 
                                    key={opt.answerOptionId} 
                                    className={`answer-option-label ${isSelected ? 'selected' : ''}`}
                                    style={{
                                        padding: '15px 20px',
                                        background: isSelected ? '#444' : '#333',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#fff',
                                        transition: 'all 0.2s',
                                        border: isSelected ? '2px solid #4CAF50' : '2px solid transparent',
                                        boxShadow: isSelected ? '0 0 15px rgba(76, 175, 80, 0.2)' : 'none'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${currentQuestion.questionId}`}
                                        value={opt.answerOptionId}
                                        checked={isSelected}
                                        onChange={() => handleAnswerChange(currentQuestion.questionId, opt.answerOptionId)}
                                        style={{ marginRight: '15px', transform: 'scale(1.3)', cursor: 'pointer' }}
                                    />
                                    {opt.text}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="quiz-navigation" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: 'none', paddingTop: 0 }}>
                    <button 
                        onClick={handlePrev}
                        className="back-button"
                        disabled={currentQuestionIndex === 0}
                        style={{ width: 'auto', padding: '12px 30px', opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                    >
                        &larr; Poprzednie
                    </button>

                    {isLastQuestion ? (
                        <button 
                            onClick={handleSubmit} 
                            className="rate-course-button"
                            style={{ width: 'auto', padding: '12px 40px', backgroundColor: '#28A745', color: '#fff' }}
                        >
                            Zakończ Powtórkę
                        </button>
                    ) : (
                        <button 
                            onClick={handleNext} 
                            className="rate-course-button"
                            style={{ width: 'auto', padding: '12px 40px' }}
                        >
                            Następne &rarr;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyReviewPage;