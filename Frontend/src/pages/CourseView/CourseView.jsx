import React, { useState } from 'react';
import '../../styles/pages/CourseView.css'; // ZMIENIONA ŚCIEŻKA
import QuizView from './QuizView.jsx';
import DiscussionThread from './DiscussionThread.jsx';
import samplePdf from '../../assets/pdf/sample.pdf'; // ZMIENIONA ŚCIEŻKA

const CourseView = ({ course, onBack, onStartRating, isInstructorView }) => {
  const [activeSection, setActiveSection] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState('lesson1');
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const selectContent = (lessonId) => {
    setIsTakingQuiz(false);
    setSelectedLesson(lessonId);
  };

  const startQuiz = () => {
    setIsTakingQuiz(true);
    setSelectedLesson(null);
  };

  const handleQuizComplete = (score, total) => {
    alert(`Ukończyłeś quiz! Twój wynik: ${score} / ${total}`);
    setIsTakingQuiz(false);
    setSelectedLesson('lesson1');
  };

  const renderLessonContent = () => {
    if (isTakingQuiz) {
      return (
        <QuizView onQuizComplete={handleQuizComplete} />
      );
    }
    
    switch (selectedLesson) {
      case 'lesson1':
        return (
          <div className="video-frame">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/sLluVHUCMww"
              title="Lekcja 1"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );

      case 'lesson2':
        return (
          <div className="notes-container">
            <h3>Notatki o kodowaniu</h3>
            <p>W tej lekcji omawiamy podstawy pisania czystego kodu:</p>
            <ul>
              <li>Używaj znaczących nazw zmiennych.</li>
              <li>Unikaj zduplikowanego kodu.</li>
              <li>Stosuj podział na funkcje i moduły.</li>
              <li>Pisz komentarze tylko tam, gdzie są potrzebne.</li>
            </ul>
          </div>
        );

      case 'lesson3':
        return (
          <div className="pdf-container">
            <iframe
              src={samplePdf} // ZMIANA: Używamy zaimportowanego PDF
              title="PDF z lekcji"
              width="100%"
              height="100%"
              frameBorder="0"
            ></iframe>
          </div>
        );

      default:
        return (
          <div className="video-placeholder">
            Wybierz lekcję z prawej strony.
          </div>
        );
    }
  };

  return (
    <div className="course-view-container">
      <div className="course-view-content">
        
        <div className="lesson-content-wrapper">
          <div className="video-section">
            {renderLessonContent()}
          </div>
          <DiscussionThread isInstructorView={isInstructorView} />
        </div>

        <div className="course-sections">
          <div
            className={`section-title ${activeSection === 1 ? 'active' : ''}`}
            onClick={() => toggleSection(1)}
          >
            Sekcja 1 kursu
          </div>

          {activeSection === 1 && (
            <div className="section-lessons">
              <p
                onClick={() => selectContent('lesson1')}
                className={selectedLesson === 'lesson1' ? 'active' : ''}
              >
                Lekcja 1
              </p>
              <p
                onClick={() => selectContent('lesson2')}
                className={selectedLesson === 'lesson2' ? 'active' : ''}
              >
                Lekcja 2
              </p>
              <p
                onClick={() => selectContent('lesson3')}
                className={selectedLesson === 'lesson3' ? 'active' : ''}
              >
                Lekcja 3
              </p>
              <p 
                onClick={startQuiz}
                className={isTakingQuiz ? 'active-quiz' : ''}
              >
                Test z Sekcji
              </p>
            </div>
          )}

          <div
            className={`section-title ${activeSection === 2 ? 'active' : ''}`}
            onClick={() => toggleSection(2)}
          >
            Sekcja 2 kursu
          </div>

          {activeSection === 2 && (
            <div className="section-lessons">
              <p>Lekcja 1</p>
              <p>Lekcja 2</p>
            </div>
          )}

          <div
            className={`section-title ${activeSection === 3 ? 'active' : ''}`}
            onClick={() => toggleSection(3)}
          >
            Sekcja 3 kursu
          </div>

          {activeSection === 3 && (
            <div className="section-lessons">
              <p>Lekcja 1</p>
            </div>
          )}

          {!isInstructorView && (
            <button className="rate-course-button" onClick={() => onStartRating(course)}>
              Oceń ten kurs
            </button>
          )}
          
          <button className="back-button" onClick={onBack}>
            Powrót
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseView;