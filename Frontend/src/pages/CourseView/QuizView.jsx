import React, { useState } from 'react';
import '../../styles/pages/QuizView.css'; // ZMIENIONA ŚCIEŻKA

const MOCK_QUIZ_DATA = {
  questions: [
    { 
      id: 'q1', 
      text: 'Które z poniższych jest językiem programowania?', 
      type: 'single', 
      options: [
        { id: 'q1o1', text: 'HTML' },
        { id: 'q1o2', text: 'Python' },
        { id: 'q1o3', text: 'CSS' },
      ],
      correctAnswer: 'q1o2'
    },
    { 
      id: 'q2', 
      text: 'Które technologie są używane do stylowania stron?', 
      type: 'multiple', 
      options: [
        { id: 'q2o1', text: 'CSS' },
        { id: 'q2o2', text: 'SASS' },
        { id: 'q2o3', text: 'JavaScript' },
      ],
      correctAnswers: ['q2o1', 'q2o2']
    },
    { 
      id: 'q3', 
      text: 'React to...?', 
      type: 'single', 
      options: [
        { id: 'q3o1', text: 'Framework' },
        { id: 'q3o2', text: 'Biblioteka' },
        { id: 'q3o3', text: 'Język programowania' },
      ],
      correctAnswer: 'q3o2' 
    }
  ]
};

const QuizView = ({ quizData = MOCK_QUIZ_DATA, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quizData.questions[currentQuestionIndex];

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
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1); // POPRAWKA: Było prev + 1
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizData.questions.forEach(q => {
      const userAnswers = selectedAnswers[q.id] || [];
      if (q.type === 'single') {
        if (userAnswers[0] === q.correctAnswer) {
          score++;
        }
      } else {
        const correct = q.correctAnswers;
        if (userAnswers.length === correct.length && userAnswers.every(ans => correct.includes(ans))) {
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
    const total = quizData.questions.length;
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
          Pytanie {currentQuestionIndex + 1} z {quizData.questions.length}
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
        {currentQuestionIndex < quizData.questions.length - 1 ? (
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