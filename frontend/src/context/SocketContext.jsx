import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
    const { user, setUser } = useContext(AuthContext);
    const socketRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Connect socket when user logs in
    useEffect(() => {
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        const socket = io(API_URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Socket conectado:', socket.id);
            socket.emit('register', user.id);
        });

        socket.on('new_notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socket.on('profile_updated', (data) => {
            if (data.userId === user.id) {
                const token = sessionStorage.getItem('token');
                if (token) {
                    fetch(`${API_URL}/api/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(res => res.json()).then(data => {
                        if (!data.error) {
                            setUser(data);
                        }
                    }).catch(err => console.error('Error fetching updated profile', err));
                }
            } else {
                // Broadcast a custom DOM event so that other components (like feed) can update if they want
                window.dispatchEvent(new CustomEvent('profile_updated_broadcast', { detail: data }));
            }
        });

        socketRef.current = socket;

        // Fetch existing notifications
        fetchNotifications();

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${API_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        } catch (err) {
            console.error('Erro ao buscar notificações:', err);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = sessionStorage.getItem('token');
            await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Erro ao marcar notificação:', err);
        }
    };

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current,
            notifications,
            unreadCount,
            markAsRead,
            fetchNotifications
        }}>
            {children}
        </SocketContext.Provider>
    );
};
