import React, { useState, useEffect, useContext } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/pages/CourseEditPage.css';
import '../../styles/pages/ProfilePage.css';
import { fetchMyStats, uploadFile, updateUserProfile, fetchUserProfile, API_BASE_URL } from '../../services/api';
import BadgesList from '../../components/Gamification/BadgesList';
import { AuthContext } from '../../context/AuthContext';

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('blob:')) return path;
  
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  
  return `${serverUrl}/${cleanPath}`;
};

const ProfilePage = ({ onBack }) => {
  const { user, updateUser } = useContext(AuthContext);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('/src/icon/usericon.png');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [login, setLogin] = useState(user?.userName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({ points: 0, currentStreak: 0, badges: [] });

  const [openItems, setOpenItems] = useState({
    dane: true,
    gamification: true,
    login: false,
    haslo: false,
    instructor: false
  });

  useEffect(() => {
      let isMounted = true;
      const loadData = async () => {
          try {
              const [statsData, profileData] = await Promise.all([
                  fetchMyStats(),
                  fetchUserProfile() 
              ]);

              if (!isMounted) return;

              setStats(statsData);
              
              if (profileData) {
                  setFirstName(profileData.firstName || '');
                  setLastName(profileData.lastName || '');
                  setLogin(profileData.userName || '');
                  setBio(profileData.bio || '');
                  
                  const loadedAvatarUrl = resolveImageUrl(profileData.avatarUrl || user?.avatarUrl);
                  setAvatarPreview(loadedAvatarUrl || '/src/icon/usericon.png');
              }
          } catch (e) {
              if (isMounted) {
                setError("Nie udało się załadować danych profilu.");
              }
          } finally {
              if (isMounted) {
                  setLoading(false);
              }
          }
      };
      loadData();

      return () => {
        isMounted = false;
      };
  }, [user?.avatarUrl]);

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (newPassword && newPassword !== confirmNewPassword) {
        setError("Nowe hasło i potwierdzenie nie są identyczne.");
        return;
    }
    setError(null);
    setLoading(true);

    let pathForDb = avatarFile ? null : user?.avatarUrl; 
    let success = false;

    try {
        if (avatarFile) {
            const uploadResult = await uploadFile(avatarFile);
            pathForDb = uploadResult.url; 
        } else if (user?.avatarUrl && !avatarFile) {
            pathForDb = user.avatarUrl;
        }
        
        const profileData = {
            firstName,
            lastName,
            userName: login,
            bio,
            avatarUrl: pathForDb,
            currentPassword: currentPassword || null,
            newPassword: newPassword || null
        };
        
        await updateUserProfile(profileData);
        
        const fullNewAvatarUrl = resolveImageUrl(pathForDb);

        if (updateUser) {
          updateUser({ ...user, firstName, lastName, userName: login, bio, avatarUrl: pathForDb });
        }
        
        setAvatarFile(null); 
        setAvatarPreview(fullNewAvatarUrl || '/src/icon/usericon.png');

        alert("Zmiany w profilu zostały zapisane!");
        success = true;
    } catch (err) {
        setError(err.message || "Wystąpił nieznany błąd podczas zapisywania zmian.");
    } finally {
        setLoading(false);
    }
    
    if (success && typeof onBack === 'function') {
      onBack();
    }
  };

  if (loading) {
      return (
          <main className="main-content">
              <div className="loading-container" style={{textAlign: 'center', marginTop: '50px'}}>Ładowanie profilu...</div>
          </main>
      );
  }

  return (
    <main className="main-content">
      <div className="edit-course-container">
        <form onSubmit={handleSubmit}>
          <div className="edit-header">
            <h2 className="page-title">Ustawienia Profilu</h2>
          </div>
          
          {error && <div className="alert-error" style={{padding: '10px', backgroundColor: '#fdd', border: '1px solid #f99', marginBottom: '20px', borderRadius: '5px'}}>{error}</div>}

          <div className="profile-form-layout">
            <div className="profile-avatar-column">
              <img 
                src={avatarPreview} 
                alt="Podgląd awatara" 
                className="profile-avatar-preview"
                key={avatarPreview} 
                onError={(e) => { e.target.onerror = null; e.target.src = '/src/icon/usericon.png'; }}
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
              
              <div style={{marginTop: '20px', textAlign: 'center', width: '100%'}}>
                  <div style={{fontSize: '2em', fontWeight: 'bold', color: '#4CAF50'}}>{stats.points}</div>
                  <div style={{color: '#aaa', fontSize: '0.9em'}}>Punkty Doświadczenia</div>
              </div>
            </div>

            <div className="profile-fields-column">
              
              <h4 
                className={`collapsible-header ${openItems.gamification ? 'open' : ''}`}
                onClick={() => toggleItem('gamification')}
              >
                Twoje Osiągnięcia
              </h4>
              {openItems.gamification && (
                  <div className="section-item">
                      <BadgesList badges={stats.badges} />
                  </div>
              )}

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
                Opis (Bio)
              </h4>
              {openItems.instructor && (
                <div className="section-item">
                  <div className="edit-form-group">
                    <label htmlFor="instructorBio">Opis (bio)</label>
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
            <button type="submit" className="edit-btn-primary" disabled={loading}>
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ProfilePage;