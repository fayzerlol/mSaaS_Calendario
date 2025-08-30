/**
 * Checks for upcoming events that need notifications.
 * @param {Array} virtualEvents - The list of all generated event instances.
 * @returns {Array} A list of notification objects.
 */
export const checkUpcomingEvents = (virtualEvents) => {
  const now = new Date();
  const upcomingNotifications = [];

  virtualEvents.forEach(event => {
    if (!event.notification || event.notification === 'none') {
      return;
    }

    const eventDateTime = new Date(`${event.virtualDate}T${event.time}`);
    let notificationTime = new Date(eventDateTime);

    switch (event.notification) {
      case '15m':
        notificationTime.setMinutes(eventDateTime.getMinutes() - 15);
        break;
      case '1h':
        notificationTime.setHours(eventDateTime.getHours() - 1);
        break;
      case '1d':
        notificationTime.setDate(eventDateTime.getDate() - 1);
        break;
      default:
        return; // Invalid notification setting
    }

    // Check if the notification time is in the past, but the event is in the future
    // This means we should be showing a notification.
    if (notificationTime <= now && eventDateTime > now) {
      upcomingNotifications.push({
        id: `notif_${event.id}`,
        eventId: event.id,
        title: event.title,
        time: event.time,
        date: event.virtualDate,
        message: `Your event "${event.title}" is starting soon at ${event.time}.`,
      });
    }
  });

  return upcomingNotifications;
};
