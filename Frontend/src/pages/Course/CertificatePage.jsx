import React from 'react';
import '../../styles/pages/CertificatePage.css'; // ZMIENIONA ŚCIEŻKA

const CertificatePage = ({ course, userName, onBack }) => {
  const completionDate = new Date().toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="main-content certificate-page-wrapper">
      <div className="certificate-actions">
        <button className="edit-btn-secondary" onClick={onBack}>
          &larr; Powrót do Mojej Nauki
        </button>
        <button className="edit-btn-primary" onClick={handlePrint}>
          Drukuj / Zapisz PDF
        </button>
      </div>

      <div className="certificate-container">
        <div className="certificate-content">
          <img 
            src="/src/logo.png" 
            alt="Logo e-Learning" 
            className="cert-logo"
          />
          <h1 className="cert-title">CERTYFIKAT UKOŃCZENIA</h1>
          <p className="cert-intro">Niniejszym poświadcza się, że</p>
          
          <h2 className="cert-user-name">{userName}</h2>
          
          <p className="cert-intro">
            pomyślnie ukończył/a kurs online
          </p>
          
          <h3 className="cert-course-title">{course.title}</h3>
          
          <div className="cert-footer">
            <div className="cert-footer-item">
              <span className="cert-label">Data ukończenia</span>
              <span className="cert-value">{completionDate}</span>
            </div>
            <div className="cert-footer-item">
              <span className="cert-label">Instruktor</span>
              <span className="cert-value">{course.instructor}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CertificatePage;