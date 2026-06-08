import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import Avatar from './Avatar';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead } = useContext(SocketContext);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.post_id) {
            setIsOpen(false);
            navigate('/');
        } else if (notification.source_user_id) {
            setIsOpen(false);
            navigate(`/profile/${notification.source_user_id}`);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like': return '❤️';
            case 'comment': return '💬';
            case 'follow': return '👤';
            case 'mention': return '📢';
            default: return '🔔';
        }
    };

    const timeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'agora';
        if (diffMin < 60) return `${diffMin}min`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h`;
        const diffD = Math.floor(diffH / 24);
        return `${diffD}d`;
    };

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            <button className="icon-btn notification-bell-btn" onClick={() => setIsOpen(!isOpen)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <h3>Notificações</h3>
                        <span className="notification-count">{unreadCount} novas</span>
                    </div>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.slice(0, 20).map(n => (
                                <div
                                    key={n.id}
                                    className={`notification-item ${!n.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div className="notification-icon">{getNotificationIcon(n.type)}</div>
                                    <div className="notification-body">
                                        <Avatar user={{ avatar: n.source_user_avatar, name: n.source_user_name }} className="notification-avatar" />
                                        <div className="notification-text">
                                            <p><strong>{n.source_user_name}</strong> {n.content}</p>
                                            <span className="notification-time">{timeAgo(n.created_at)}</span>
                                        </div>
                                    </div>
                                    {!n.read && <div className="notification-dot"></div>}
                                </div>
                            ))
                        ) : (
                            <div className="notification-empty">
                                <span>🔔</span>
                                <p>Nenhuma notificação ainda</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
