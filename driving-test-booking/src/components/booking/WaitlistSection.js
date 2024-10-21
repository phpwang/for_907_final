import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { AUCKLAND_LOCATIONS, VENUES } from '../../constants/locations';

const WaitlistSection = ({ onJoinWaitlist, loading }) => {
  const [waitlistDate, setWaitlistDate] = useState(new Date(Date.now() + 86400000)); // 默认选择明天
  const [preferredLocation, setPreferredLocation] = useState('');
  const [preferredVenue, setPreferredVenue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoinWaitlist(waitlistDate, preferredLocation, preferredVenue);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Join Waitlist</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
          <DatePicker
            selected={waitlistDate}
            onChange={date => setWaitlistDate(date)}
            minDate={new Date(Date.now() + 86400000)} // 最小日期为明天
            className="mt-1 block w-full border rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Location (Optional)</label>
          <select
            value={preferredLocation}
            onChange={e => {
              setPreferredLocation(e.target.value);
              setPreferredVenue('');
            }}
            className="mt-1 block w-full border rounded-md shadow-sm"
          >
            <option value="">Any Location</option>
            {AUCKLAND_LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        {preferredLocation && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Venue (Optional)</label>
            <select
              value={preferredVenue}
              onChange={e => setPreferredVenue(e.target.value)}
              className="mt-1 block w-full border rounded-md shadow-sm"
            >
              <option value="">Any Venue in {preferredLocation}</option>
              {VENUES[preferredLocation].map(venue => (
                <option key={venue} value={venue}>{venue}</option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded disabled:bg-green-300"
        >
          {loading ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>
    </div>
  );
};

export default WaitlistSection;