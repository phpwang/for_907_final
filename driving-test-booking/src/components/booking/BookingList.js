import React from 'react';

const BookingList = ({ bookings, onCancel }) => {
  if (bookings.length === 0) {
    return <p className="text-gray-500 italic">No bookings found.</p>;
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => (
        <li key={booking.id} className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">Date: {new Date(booking.testDate).toLocaleString()}</p>
            <p>Location: {booking.location}</p>
            <p>Venue: {booking.venue}</p>
          </div>
          <button 
            onClick={() => onCancel(booking.id)} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </li>
      ))}
    </ul>
  );
};

export default BookingList;