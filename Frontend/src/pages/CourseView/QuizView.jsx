import React, { useState } from 'react';
import '../../styles/pages/QuizView.css'; 

const QuizView = ({ quizData, onQuizComplete }) => {
    // 1. Parsowanie JSON string na obiekt pytań.
    let loadedQuestions = [];
    
    if (quizData && quizData.quizDataJson) {
        try {
            const parsedData = JSON.parse(quizData.quizDataJson);
            loadedQuestions = parsedData.questions || [];
        } catch (e) {
            console.error("Błąd parsowania QuizDataJson:", e);
        }
    } else if (quizData && Array.isArray(quizData.questions)) {
        loadedQuestions = quizData.questions;
    }

    // Gwarantujemy UNIKALNE, STABILNE ID dla KAŻDEGO pytania.
    // To jest kluczowe dla poprawnego śledzenia odpowiedzi w selectedAnswers.
    const questions = loadedQuestions.map((q, index) => ({
        ...q,
        // Używamy oryginalnego q.id, jeśli istnieje, lub indexu jako fallbacka.
        stableId: q.id || `q-temp-${index}` 
    }));
    
    // Konieczne jest użycie tego stableId w całym komponencie.
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
    const currentQuestionKey = currentQuestion.stableId; // Używamy stableId jako klucza!

    const handleOptionSelect = (optionId) => {
        setSelectedAnswers(prev => {
            const currentSelections = prev[currentQuestionKey] || [];
            
            // KLUCZ: Używamy stableId do zapisania odpowiedzi
            if (currentQuestion.type === 'single') {
                return { ...prev, [currentQuestionKey]: [optionId] };
            }
            
            if (currentSelections.includes(optionId)) {
                return {
                    ...prev,
                    [currentQuestionKey]: currentSelections.filter(id => id !== optionId)
                };
            } else {
                return {
                    ...prev,
                    [currentQuestionKey]: [...currentSelections, optionId]
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
        questions.forEach(q => {
            // KLUCZ: Używamy stableId do pobrania odpowiedzi
            const userAnswers = selectedAnswers[q.stableId] || [];

            // POBRANIE POPRAWNYCH ODPOWIEDZI Z OPCJI DLA KAŻDEGO TYPU PYTANIA
            const correctOptionIds = q.options
                .filter(option => option.isCorrect)
                .map(option => option.id);
            
            // Tworzymy Set z poprawnych odpowiedzi dla efektywnego sprawdzania istnienia
            const correctSet = new Set(correctOptionIds);

            if (q.type === 'single') {
                // LOGIKA DLA PYTAŃ JEDNOKROTNEGO WYBORU
                const userAnswerId = userAnswers[0];
                
                if (userAnswerId && correctSet.has(userAnswerId)) {
                    score++;
                }
            } else {
                // Dla multiple-choice (checkbox):
                
                const isCorrectLength = userAnswers.length === correctSet.size;
                const allSelectedAreCorrect = userAnswers.every(ansId => correctSet.has(ansId));
                
                if (isCorrectLength && allSelectedAreCorrect) {
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

    const currentSelections = selectedAnswers[currentQuestionKey] || [];

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
                                name={`question-${currentQuestionKey}`} // Używamy stableId w nazwie
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