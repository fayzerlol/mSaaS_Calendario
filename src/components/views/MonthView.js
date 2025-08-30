import React from 'react';

// Helper to get date in YYYY-MM-DD format
const getISODate = (date) => date.toISOString().split('T')[0];

const MonthView = ({ events, setEventToEdit, currentDate, setCurrentDate, setActiveView }) => {

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1; // Monday-indexed
  const daysInMonth = endOfMonth.getDate();
  const days = [];

  // Add padding for days before the start of the month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleDayClick = (date) => {
    setCurrentDate(date);
    setActiveView('day');
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-300 rounded-md">&larr; Previous</button>
        <h2 className="text-2xl font-bold text-center">{monthName}</h2>
        <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-300 rounded-md">Next &rarr;</button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center font-bold p-2">{day}</div>
        ))}
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="border rounded-md h-32 bg-gray-100"></div>;
          }
          const isoDate = getISODate(day);
          const eventsForDay = events.filter(event => event.date === isoDate);

          return (
            <div key={isoDate} onClick={() => handleDayClick(day)} className="border rounded-md h-32 p-2 bg-white cursor-pointer hover:bg-indigo-50">
              <span className="font-bold">{day.getDate()}</span>
              <div className="mt-1 text-xs space-y-1">
                {eventsForDay.slice(0, 2).map(event => (
                  <div key={event.id} className="bg-indigo-200 p-1 rounded truncate">
                    {event.title}
                  </div>
                ))}
                {eventsForDay.length > 2 && (
                  <div className="text-indigo-700 font-bold">
                    + {eventsForDay.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
