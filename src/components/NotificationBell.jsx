import React from 'react';

const NotificationBell = ({ count = 0, onClick = () => {} }) => (
	<button onClick={onClick} aria-label="notifications">
		🔔 {count}
	</button>
);

export default NotificationBell;
