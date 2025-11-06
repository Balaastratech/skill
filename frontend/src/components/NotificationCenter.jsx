import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast, ToastContainer } from 'react-bootstrap';
import { removeNotification } from '../features/notifications/notificationsSlice';

function NotificationCenter() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.notifications.items);

  useEffect(() => {
    const timers = items.map((n) =>
      setTimeout(() => dispatch(removeNotification(n.id)), n.timeout || 4000)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [items, dispatch]);

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 2000 }}>
      {items.map((n) => (
        <Toast key={n.id} bg={n.variant === 'success' ? 'light' : n.variant} onClose={() => dispatch(removeNotification(n.id))}>
          <Toast.Header closeButton>
            <strong className="me-auto">{n.title}</strong>
          </Toast.Header>
          <Toast.Body>{n.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}

export default NotificationCenter;
