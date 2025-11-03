import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// ZMIANA: Importujemy style z nowej lokalizacji
import '../../styles/pages/CourseEditPage.css';
import '../../styles/pages/ProfilePage.css';

// Usunęliśmy import RteToolbar

const ProfilePage = ({ onBack }) => {
  // ... (cała logika komponentu bez zmian) ...
  const [avatarPreview, setAvatarPreview] = useState('/src/icon/usericon.png');
  const [firstName, setFirstName] = useState('Jan');
  const [lastName, setLastName] = useState('Kowalski');
  const [login, setLogin] = useState('test');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [bio, setBio] = useState('Ekspert w dziedzinie baz danych z 10-letnim doświadczeniem. Pasjonat czystego kodu i efektywnych zapytań SQL.');
  
  const [openItems, setOpenItems] = useState({
    dane: true,
    login: true,
    haslo: true,
    instructor: true
  });

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newPassword || currentPassword || confirmNewPassword) {
      if (!newPassword || !currentPassword || !confirmNewPassword) {
        alert("Aby zmienić hasło, musisz wypełnić wszystkie trzy pola: aktualne, nowe i potwierdzenie.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert("Nowe hasła nie są zgodne.");
        return;
      }
      console.log("Zmieniam hasło...");
    }
    
    console.log("Zapisano dane profilu:", { firstName, lastName, login, bio, avatarPreview });
    alert("Zmiany w profilu zostały zapisane!");
    onBack();
  };

  return (
    <main className="main-content">
      <div className="edit-course-container">
        <form onSubmit={handleSubmit}>
          <div className="edit-header">
            <h2 className="page-title">Ustawienia Profilu</h2>
          </div>

          <div className="profile-form-layout">
            <div className="profile-avatar-column">
              <img 
                src={avatarPreview} 
                alt="Podgląd awatara" 
                className="profile-avatar-preview"
              />
              <input 
                type="file" 
                id="avatarUpload" 
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }} 
              />
              <label htmlFor="avatarUpload" className="profile-avatar-button">
                Zmień zdjęcie
              </label>
            </div>

            <div className="profile-fields-column">
              
              <h4 
                className={`collapsible-header ${openItems.dane ? 'open' : ''}`}
                onClick={() => toggleItem('dane')}
              >
                Dane Główne
              </h4>
              {openItems.dane && (
                <div className="section-item">
                  <div className="edit-form-group">
                    <label htmlFor="firstName">Imię</label>
                    <input
                      type="text"
                      id="firstName"
                      className="edit-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label htmlFor="lastName">Nazwisko</label>
                    <input
                      type="text"
                      id="lastName"
                      className="edit-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <h4 
                className={`collapsible-header ${openItems.login ? 'open' : ''}`}
                onClick={() => toggleItem('login')}
              >
                Zmiana Loginu
              </h4>
              {openItems.login && (
                <div className="section-item">
                  <div className="edit-form-group">
                    <label htmlFor="login">Login</label>
                    <input
                      type="text"
                      id="login"
                      className="edit-input"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <h4 
                className={`collapsible-header ${openItems.haslo ? 'open' : ''}`}
                onClick={() => toggleItem('haslo')}
              >
                Zmiana Hasła
              </h4>
              {openItems.haslo && (
                <div className="section-item">
                  <div className="edit-form-group">
                    <label htmlFor="currentPassword">Aktualne hasło</label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="edit-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Wpisz aktualne hasło"
                    />
                  </div>
                  <div className="edit-form-group">
                    <label htmlFor="newPassword">Nowe hasło</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="edit-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Wpisz nowe hasło (min. 6 znaków)"
                    />
                  </div>
                  <div className="edit-form-group">
                    <label htmlFor="confirmNewPassword">Potwierdź nowe hasło</label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      className="edit-input"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Powtórz nowe hasło"
                    />
                  </div>
                </div>
              )}

              <h4 
                className={`collapsible-header ${openItems.instructor ? 'open' : ''}`}
                onClick={() => toggleItem('instructor')}
              >
                Zmień Opis
              </h4>
              {openItems.instructor && (
                <div className="section-item">
                  <div className="edit-form-group">
                    <label htmlFor="instructorBio">Opis nstruktora (bio)</label>
                    <div className="text-editor-wrapper-quill">
                      <ReactQuill 
                        theme="snow" 
                        value={bio} 
                        onChange={setBio} 
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="edit-btn-secondary" onClick={onBack}>
              Anuluj
            </button>
            <button type="submit" className="edit-btn-primary">
              Zapisz zmiany
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ProfilePage;