import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '../config';

export const useWebSocket = (namespace = '') => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(`${API_CONFIG.WS_URL}${namespace}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [namespace]);

  // Subscribe to event
  const subscribe = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, (data) => {
        setLastMessage({ event, data, timestamp: Date.now() });
        callback(data);
      });
    }
  };

  // Unsubscribe from event
  const unsubscribe = (event) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  // Emit event
  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    isConnected,
    lastMessage,
    subscribe,
    unsubscribe,
    emit,
  };
};

// Hook for real-time stats updates
export const useRealtimeStats = () => {
  const [stats, setStats] = useState(null);
  const { isConnected, subscribe, unsubscribe } = useWebSocket('/stats');

  useEffect(() => {
    if (isConnected) {
      subscribe('stats_update', (data) => {
        setStats(data);
      });

      // Request initial data
      subscribe('initial_stats', (data) => {
        setStats(data);
      });
    }

    return () => {
      unsubscribe('stats_update');
      unsubscribe('initial_stats');
    };
  }, [isConnected]);

  return { stats, isConnected };
};

// Hook for new lead notifications
export const useLeadNotifications = (onNewLead) => {
  const { isConnected, subscribe, unsubscribe } = useWebSocket('/leads');

  useEffect(() => {
    if (isConnected && onNewLead) {
      subscribe('new_lead', (data) => {
        onNewLead(data);
      });
    }

    return () => {
      unsubscribe('new_lead');
    };
  }, [isConnected, onNewLead]);

  return { isConnected };
};
