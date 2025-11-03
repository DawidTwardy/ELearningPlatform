import React from 'react';
import '../../styles/components/NotificationsDropdown.css'; 

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Gratulacje! Ukończyłeś kurs 'Kurs Nauki SQL'.", type: "success", read: false },
  { id: 2, text: "Jan Kowalski dodał nową lekcję do kursu 'Kurs Pythona'.", type: "update", read: false },
  { id: 3, text: "Twój instruktor, Michał Nowak, opublikował nowy kurs 'Kurs .Net Core'.", type: "info", read: true },
  { id: 4, text: "Zbliża się termin testu w 'Kurs AI'. Nie zapomnij go ukończyć!", type: "alert", read: true },
];

const NotificationItem = ({ notification }) => {
  return (
    <div className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}>
      <div className="notification-icon">
        {notification.type === 'success' && '🏆'}
        {notification.type === 'update' && '🔄'}
        {notification.type === 'info' && 'ℹ️'}
        {notification.type === 'alert' && '⚠️'}
      </div>
      <div className="notification-text">
        {notification.text}
      </div>
    </div>
  );
};

const NotificationsDropdown = ({ onClose }) => {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="notifications-dropdown-menu">
      <div className="notifications-header">
        <h3>Powiadomienia</h3>
        {unreadCount > 0 && (
          <span className="unread-count-badge">{unreadCount}</span>
        )}
      </div>
      <div className="notifications-list">
        {MOCK_NOTIFICATIONS.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
      <div className="notifications-footer">
        <button className="notifications-footer-btn" onClick={onClose}>
          Zamknij
        </button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;