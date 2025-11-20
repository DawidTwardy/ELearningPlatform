import React, { useEffect, useState } from 'react';
import '../../styles/components/NotificationsDropdown.css'; 
import { fetchNotifications, markNotificationRead } from '../../services/api';

const NotificationItem = ({ notification, onRead }) => {
  const handleClick = () => {
      if (!notification.isRead) {
          onRead(notification.id);
      }
  };

  return (
    <div 
      className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.type}`}
      onClick={handleClick}
    >
      <div className="notification-icon">
        {notification.type === 'success' && '🏆'}
        {notification.type === 'update' && '🔄'}
        {notification.type === 'info' && 'ℹ️'}
        {notification.type === 'alert' && '⚠️'}
      </div>
      <div className="notification-text">
        {notification.message}
      </div>
    </div>
  );
};

const NotificationsDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
      try {
          const data = await fetchNotifications();
          setNotifications(data);
      } catch (error) {
          console.error("Błąd pobierania powiadomień", error);
      } finally {
          setLoading(false);
      }
  };

  const handleMarkRead = async (id) => {
      try {
          await markNotificationRead(id);
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      } catch (error) {
          console.error(error);
      }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-dropdown-menu">
      <div className="notifications-header">
        <h3>Powiadomienia</h3>
        {unreadCount > 0 && (
          <span className="unread-count-badge">{unreadCount}</span>
        )}
      </div>
      <div className="notifications-list">
        {loading ? (
            <div style={{padding: '10px', textAlign: 'center'}}>Ładowanie...</div>
        ) : notifications.length === 0 ? (
            <div style={{padding: '10px', textAlign: 'center'}}>Brak powiadomień</div>
        ) : (
            notifications.map(notification => (
                <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onRead={handleMarkRead}
                />
            ))
        )}
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