import React from 'react';

const NotificationPanel = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) {
    return (
      <div className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-xl p-4 text-center text-gray-500">
        No new notifications.
      </div>
    );
  }

  return (
    <div className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-xl p-4 space-y-2">
      {notifications.map(notif => (
        <div key={notif.id} className="p-2 bg-gray-100 rounded-md flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold">{notif.title}</p>
            <p className="text-xs text-gray-600">{notif.message}</p>
          </div>
          <button
            onClick={() => onDismiss(notif.id)}
            className="text-xs text-red-500 hover:underline ml-2"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;
