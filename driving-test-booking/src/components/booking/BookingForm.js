import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { AUCKLAND_LOCATIONS, VENUES } from '../../constants/locations';

const BookingForm = ({ onSubmit, loading }) => {
  const [testDate, setTestDate] = useState(new Date(Date.now() + 86400000)); // 设置默认日期为明天
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [availableVenues, setAvailableVenues] = useState([]);

  useEffect(() => {
    if (location) {
      setAvailableVenues(VENUES[location] || []);
      setVenue('');
    }
  }, [location]);

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
          minDate={new Date(Date.now() + 86400000)} // 设置最小日期为明天
          className="mt-1 block w-full border rounded-md shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="mt-1 block w-full border rounded-md shadow-sm"
          required
        >
          <option value="">Select a location</option>
          {AUCKLAND_LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Venue</label>
        <select
          value={venue}
          onChange={e => setVenue(e.target.value)}
          className="mt-1 block w-full border rounded-md shadow-sm"
          required
          disabled={!location}
        >
          <option value="">Select a venue</option>
          {availableVenues.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
      <button 
        type="submit" 
        disabled={loading || !location || !venue}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
      >
        {loading ? 'Booking...' : 'Book Test'}
      </button>
    </form>
  );
};

export default BookingForm;