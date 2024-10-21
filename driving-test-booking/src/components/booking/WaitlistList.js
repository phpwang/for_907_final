import React from 'react';

const WaitlistList = ({ entries }) => {
  if (entries.length === 0) {
    return <p>You are not on any waitlists.</p>;
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry, index) => (
        <li key={index} className="border rounded-lg p-3">
          <p>Date: {entry.testDate.toLocaleDateString()}</p>
          <p>Preferred Location: {entry.preferredLocation || 'Any'}</p>
          <p>Preferred Venue: {entry.preferredVenue || 'Any'}</p>
        </li>
      ))}
    </ul>
  );
};

export default WaitlistList;