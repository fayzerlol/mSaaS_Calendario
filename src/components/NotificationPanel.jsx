import React from 'react';

const NotificationPanel = ({ notifications = [], onDismiss = () => {}, onClose = () => {} }) => (
  <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow p-2">
    <div className="flex justify-between items-center mb-2">
      <strong>Notifications</strong>
      <button onClick={onClose}>✖</button>
    </div>
    {notifications.length === 0 ? (
      <p className="text-sm text-gray-600">No notifications</p>
    ) : (
      notifications.map(n => (
        <div key={n.id} className="p-2 border-b">
          <div className="text-sm">{n.message || 'Notification'}</div>
          <button className="text-xs text-blue-500" onClick={() => onDismiss(n.id)}>Dismiss</button>
        </div>
      ))
    )}
  </div>
);

export default NotificationPanel;
