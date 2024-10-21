import React, { useState } from 'react';
import EthereumAuth from './components/auth/EthereumAuth';
import BookingForm from './components/booking/BookingForm';
import BookingList from './components/booking/BookingList';
import WaitlistSection from './components/booking/WaitlistSection';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './constants/contract';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAccount, setUserAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [waitlistEntries, setWaitlistEntries] = useState([]);

  const handleLogin = async (account) => {
    setIsAuthenticated(true);
    setUserAccount(account);
    // Initialize web3 and contract here when we have a real contract
  };

  const handleBooking = async (bookingData) => {
    setLoading(true);
    setError('');
    try {
      // Mock booking process
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newBooking = {
        id: Date.now(),
        ...bookingData
      };
      setBookings(prevBookings => [...prevBookings, newBooking]);
      alert('Booking successful! (Mock)');
    } catch (err) {
      setError('Booking failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setLoading(true);
    setError('');
    try {
      // Mock cancellation process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
      alert('Booking cancelled successfully! (Mock)');
    } catch (err) {
      setError('Cancellation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async (preferredDate) => {
    setLoading(true);
    setError('');
    try {
      // Mock join waitlist process
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newWaitlistEntry = {
        id: Date.now(),
        preferredDate,
        status: 'Waiting'
      };
      setWaitlistEntries(prevEntries => [...prevEntries, newWaitlistEntry]);
      alert('Successfully joined the waitlist! (Mock)');
    } catch (err) {
      setError('Failed to join waitlist: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-semibold mb-5">Driving Test Booking System</h1>
          {!isAuthenticated ? (
            <EthereumAuth onLogin={handleLogin} onError={setError} />
          ) : (
            <div>
              <p className="mb-4">Welcome, {userAccount}</p>
              <BookingForm onSubmit={handleBooking} loading={loading} />
              {error && <p className="text-red-500 mt-4">{error}</p>}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
                <BookingList bookings={bookings} onCancel={handleCancelBooking} />
              </div>
              <WaitlistSection onJoinWaitlist={handleJoinWaitlist} loading={loading} />
              {waitlistEntries.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Your Waitlist Entries</h2>
                  <ul>
                    {waitlistEntries.map(entry => (
                      <li key={entry.id} className="mb-2">
                        Date: {entry.preferredDate.toLocaleDateString()} - Status: {entry.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;