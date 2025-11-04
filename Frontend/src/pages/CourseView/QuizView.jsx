import React, { useState } from 'react';
import '../../styles/pages/QuizView.css'; 

// Usunięto MOCK_QUIZ_DATA - używamy danych z API

const QuizView = ({ quizData = { questions: [] }, onQuizComplete }) => {
    // 1. Zabezpieczenie: Definiujemy bezpieczną tablicę pytań
    const questions = quizData.questions || []; 
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    // 2. Wczesny powrót: Obsługa pustego quizu
    if (questions.length === 0) {
        return (
            <div className="quiz-container">
                <h2 className="quiz-title">Brak Pytań</h2>
                <p>Ten quiz nie zawiera jeszcze żadnych pytań lub wystąpił błąd ładowania.</p>
                <button className="quiz-nav-button" onClick={() => onQuizComplete(0, 0)}>
                    Powrót do lekcji
                </button>
            </div>
        );
    }

    // 3. Używamy bezpiecznej zmiennej questions
    const currentQuestion = questions[currentQuestionIndex];

    const handleOptionSelect = (optionId) => {
        setSelectedAnswers(prev => {
            const currentSelections = prev[currentQuestion.id] || [];
            
            if (currentQuestion.type === 'single') {
                return { ...prev, [currentQuestion.id]: [optionId] };
            }
            
            if (currentSelections.includes(optionId)) {
                return {
                    ...prev,
                    [currentQuestion.id]: currentSelections.filter(id => id !== optionId)
                };
            } else {
                return {
                    ...prev,
                    [currentQuestion.id]: [...currentSelections, optionId]
                };
            }
        });
    };

    const goToNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const calculateScore = () => {
        let score = 0;
        // Używamy bezpiecznej zmiennej questions
        questions.forEach(q => {
            const userAnswers = selectedAnswers[q.id] || [];
            if (q.type === 'single') {
                if (userAnswers[0] === q.correctAnswer) {
                    score++;
                }
            } else {
                const correct = q.correctAnswers;
                // Musimy mieć pewność, że correct to tablica
                if (userAnswers.length === (correct || []).length && userAnswers.every(ans => (correct || []).includes(ans))) {
                    score++;
                }
            }
        });
        return score;
    };

    const handleFinishQuiz = () => {
        setShowResults(true);
    };

    if (showResults) {
        const score = calculateScore();
        const total = questions.length;
        const percentage = ((score / total) * 100).toFixed(0);

        return (
            <div className="quiz-container quiz-results">
                <h2 className="quiz-title">Wyniki Testu</h2>
                <div className="quiz-score">
                    Twój wynik: {score} / {total} ({percentage}%)
                </div>
                <button className="quiz-nav-button" onClick={() => onQuizComplete(score, total)}>
                    Powrót do lekcji
                </button>
            </div>
        );
    }

    const currentSelections = selectedAnswers[currentQuestion.id] || [];

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h2 className="quiz-title">Test z Sekcji</h2>
                <div className="quiz-progress">
                    Pytanie {currentQuestionIndex + 1} z {questions.length}
                </div>
            </div>
            
            <div className="quiz-question-body">
                <h3 className="quiz-question-text">{currentQuestion.text}</h3>
                <div className="quiz-options">
                    {currentQuestion.options.map(option => (
                        <label 
                            key={option.id} 
                            className={`quiz-option-label ${currentSelections.includes(option.id) ? 'selected' : ''}`}
                        >
                            <input
                                type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                                name={`question-${currentQuestion.id}`}
                                checked={currentSelections.includes(option.id)}
                                onChange={() => handleOptionSelect(option.id)}
                                className="quiz-option-input"
                            />
                            {option.text}
                        </label>
                    ))}
                </div>
            </div>
            
            <div className="quiz-navigation">
                <button 
                    className="quiz-nav-button"
                    onClick={goToPrev} 
                    disabled={currentQuestionIndex === 0}
                >
                    Poprzednie
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                    <button 
                        className="quiz-nav-button"
                        onClick={goToNext}
                    >
                        Następne
                    </button>
                ) : (
                    <button 
                        className="quiz-nav-button finish"
                        onClick={handleFinishQuiz}
                    >
                        Zakończ Test
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizView;