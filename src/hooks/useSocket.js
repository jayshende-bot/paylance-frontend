import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';
import { useSelector } from 'react-redux';
import { selectAccessToken, selectIsAuthenticated } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://paylance-backend.vercel.app';

// Vercel serverless does not support persistent WebSocket connections.
// Disable socket entirely when backend is on Vercel to avoid endless 404 polling.
const SOCKET_ENABLED = !SOCKET_URL.includes('vercel.app');

let socket = null;

export const useSocket = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!SOCKET_ENABLED || !isAuthenticated || !accessToken) return;
    if (socket?.connected) return;

    socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    socket.on('notification:new', (notification) => {
      dispatch(addNotification(notification));
      toast(notification.message, {
        icon: notification.type.includes('payment') ? '💰' : '🔔',
        duration: 5000,
      });
    });

    socket.on('payment:funded', ({ amount }) => {
      toast.success(`Escrow funded! $${amount} secured.`);
    });

    socket.on('payment:released', ({ amount }) => {
      toast.success(`$${amount} released to your account!`);
    });

    socket.on('milestone:submitted', ({ title }) => {
      toast(`Work submitted for: ${title}`, { icon: '📋' });
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [isAuthenticated, accessToken, dispatch]);

  const joinContract = (contractId) => socket?.emit('join:contract', contractId);
  const leaveContract = (contractId) => socket?.emit('leave:contract', contractId);

  return { socket, joinContract, leaveContract };
};
