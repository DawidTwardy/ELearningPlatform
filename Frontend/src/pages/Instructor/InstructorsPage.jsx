import React from 'react';
import '../../styles/components/App.css'; // ZMIENIONA ŚCIEŻKA
import '../../styles/pages/InstructorsPage.css'; // ZMIENIONA ŚCIEŻKA

const instructorsData = [
  { 
    id: 1,
    name: "Michał Nowak", 
    avatarSrc: "/src/icon/usericon.png", 
    bio: "Ekspert w dziedzinie baz danych z 10-letnim doświadczeniem. Pasjonat czystego kodu i efektywnych zapytań SQL. Autor bestsellerowych kursów o programowaniu.",
    topCourses: [
      "Kurs Nauki SQL",
      "Kurs AI",
      "Kurs .Net Core"
    ]
  },
  { 
    id: 2,
    name: "Jan Kowalski", 
    avatarSrc: "/src/icon/usericon.png", 
    bio: "Programista Python z zamiłowaniem do uczenia maszynowego i analizy danych. W wolnym czasie tworzy aplikacje webowe i uczy innych.",
    topCourses: [
      "Kurs Pythona",
      "Drugi Najlepiej Oceniany kurs",
      "Trzeci Najlepiej Oceniany kurs"
    ]
  }
];

const InstructorCard = ({ instructor, onClick }) => (
  <div className="instructor-card" onClick={onClick}>
    <div className="instructor-avatar-container">
      <img 
        src={instructor.avatarSrc} 
        alt={`Awatar ${instructor.name}`} 
        className="instructor-avatar" 
      />
    </div>
    
    <h3 className="instructor-name">{instructor.name}</h3>
    
    <div className="instructor-courses">
      {instructor.topCourses.map((course, index) => (
        <p key={index} className="course-list-item">
          {course}
        </p>
      ))}
      <a href="#wszystkie" className="show-all-courses" onClick={(e) => e.stopPropagation()}>
        Pokaż Wszystkie kursy
      </a>
    </div>
  </div>
);

const InstructorsPage = ({ onInstructorClick }) => {
  return (
    <main className="main-content">
      <h2 className="page-title">Instruktorzy</h2> 
      
      <div className="instructor-list">
        {instructorsData.map((instructor) => (
          <InstructorCard 
            key={instructor.id} 
            instructor={instructor} 
            onClick={() => onInstructorClick(instructor)}
          />
        ))}
      </div>
    </main>
  );
};

export default InstructorsPage;