import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const WaitlistSection = ({ onJoinWaitlist, loading }) => {
  const [waitlistDate, setWaitlistDate] = useState(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoinWaitlist(waitlistDate);
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
            className="mt-1 block w-full border rounded-md shadow-sm"
          />
        </div>
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