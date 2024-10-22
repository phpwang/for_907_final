import React from 'react';

const WaitlistList = ({ entries }) => {
console.log('Rendering WaitlistList with entries:', entries);

if (entries.length === 0) {
    return <p>You are not on any waitlists.</p>;
}

return (
    <ul className="space-y-2">
    {entries.map((entry, index) => (
        <li key={index} className="border rounded-lg p-3">
        <p>Date: {entry.testDate.toLocaleDateString()} {entry.testDate.toLocaleTimeString()}</p>
        <p>Location: {entry.preferredLocation || 'Any'}</p>
        <p>Venue: {entry.preferredVenue || 'Any'}</p>
        </li>
    ))}
    </ul>
);
};

export default WaitlistList;