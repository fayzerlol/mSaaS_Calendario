import React, { useState } from 'react';

const AddEvent = () => {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('Mon');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to save the event will be added later
    console.log({ title, day, time });
    setTitle('');
    setDay('Mon');
    setTime('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h3 className="text-xl font-bold mb-2">Add New Event</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="p-2 border rounded"
        />
        <select value={day} onChange={(e) => setDay(e.target.value)} className="p-2 border rounded">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">Add Event</button>
    </form>
  );
};

export default AddEvent;
