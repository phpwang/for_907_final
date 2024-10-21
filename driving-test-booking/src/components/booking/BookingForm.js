import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = ({ onSubmit, loading }) => {
  const [testDate, setTestDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ testDate, location, venue });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Test Date</label>
        <DatePicker 
          selected={testDate} 
          onChange={date => setTestDate(date)} 
          className="mt-1 block w-full border rounded-md shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="mt-1 block w-full border rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Venue</label>
        <input
          type="text"
          value={venue}
          onChange={e => setVenue(e.target.value)}
          className="mt-1 block w-full border rounded-md shadow-sm"
          required
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
      >
        {loading ? 'Booking...' : 'Book Test'}
      </button>
    </form>
  );
};

export default BookingForm;