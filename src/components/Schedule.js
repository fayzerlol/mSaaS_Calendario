import React from 'react';

const Schedule = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-4">Weekly Schedule</h2>
      <div className="grid grid-cols-7 gap-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{day}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
