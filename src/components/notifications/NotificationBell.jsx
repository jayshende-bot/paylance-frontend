import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { markAllRead } from '../../store/slices/notificationSlice';
import { markNotificationsRead } from '../../api/analyticsApi';
import { timeAgo } from '../../utils/dateHelpers';
import { clsx } from 'clsx';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((s) => s.notifications);

  const handleMarkAllRead = async () => {
    await markNotificationsRead([]);
    dispatch(markAllRead());
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No notifications</p>
            ) : (
              items.slice(0, 20).map((n) => (
                <div
                  key={n._id || n.id}
                  className={clsx(
                    'px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50',
                    !n.isRead && 'bg-primary-50/50'
                  )}
                >
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
