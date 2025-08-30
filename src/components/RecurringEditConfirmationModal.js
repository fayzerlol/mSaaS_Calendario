import React from 'react';

const RecurringEditConfirmationModal = ({ onConfirm, onCancel, action }) => {
  const actionText = action === 'edit' ? 'edit' : 'delete';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Recurring Event</h2>
        <p className="mb-6">How would you like to {actionText} this event?</p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onConfirm('one')}
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            This event only
          </button>
          <button
            onClick={() => onConfirm('future')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            This and all future events
          </button>
          {/* <button
            onClick={() => onConfirm('all')}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            All events in the series
          </button> */}
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 mt-4 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringEditConfirmationModal;
