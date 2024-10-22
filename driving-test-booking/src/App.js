import React, { useState, useEffect } from 'react';
import EthereumAuth from './components/auth/EthereumAuth';
import BookingForm from './components/booking/BookingForm';
import BookingList from './components/booking/BookingList';
import WaitlistSection from './components/booking/WaitlistSection';
import WaitlistList from './components/booking/WaitlistList';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAccount, setUserAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [waitlistEntries, setWaitlistEntries] = useState([]);


  useEffect(() => {
    if (contract && contract.events) {
      const setupEventListener = async () => {
        try {
          const eventEmitter = contract.events.MovedFromWaitlist({});
          eventEmitter.on('data', (event) => {
            console.log('MovedFromWaitlist event:', event);
            loadBookings(contract, userAccount);
          });
          eventEmitter.on('error', console.error);
        } catch (error) {
          console.error('Error setting up event listener:', error);
        }
      };
  
      setupEventListener();
  
      return () => {
        if (contract.events.MovedFromWaitlist) {
          contract.events.MovedFromWaitlist().removeAllListeners();
        }
      };
    }
  }, [contract, userAccount]);


  const handleLogin = async (account, contractInstance) => {
    setIsAuthenticated(true);
    setUserAccount(account);
    setContract(contractInstance);
    loadBookings(contractInstance, account);
    loadWaitlistEntries(contractInstance, account);
  };

  const loadBookings = async (contractInstance, account) => {
    setLoading(true);
    try {
      const nextBookingId = await contractInstance.methods.nextBookingId().call();
      const loadedBookings = [];
      for (let i = 0; i < Number(nextBookingId); i++) {
        const booking = await contractInstance.methods.getBooking(i).call();
        if (booking[0] === account && booking[4]) {  // booking[4] is isActive
          loadedBookings.push({
            id: i,
            testDate: new Date(Number(booking[1]) * 1000), // Convert BigInt to Number
            location: booking[2],
            venue: booking[3]
          });
        }
      }
      setBookings(loadedBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Error loading bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (bookingData) => {
    setLoading(true);
    setError('');
    try {
      const now = Math.floor(Date.now() / 1000);
      const testDateTimestamp = Math.floor(bookingData.testDate.getTime() / 1000);
      
      if (testDateTimestamp <= now) {
        throw new Error("Test date must be in the future");
      }
  
      console.log('Booking for date:', new Date(testDateTimestamp * 1000).toLocaleString());

      

      // try estimateGas
      const gasEstimate = await contract.methods.createBooking(
        testDateTimestamp,
        bookingData.location,
        bookingData.venue
      ).estimateGas({ from: userAccount });

      console.log('Estimated gas:', gasEstimate);
      
      // if estimateGas ok , then create
      const result = await contract.methods.createBooking(
        testDateTimestamp,
        bookingData.location,
        bookingData.venue
      ).send({ from: userAccount});

      console.log('Transaction result:', result);
      loadBookings(contract, userAccount);
      alert('Booking successful!');
    } catch (err) {
      console.error('Booking error:', err);
      if (err.message.includes('Test date must be in the future')) {
        setError('Booking failed: Test date must be in the future');
      } else if (err.message.includes('execution reverted')) {
       
        const revertReason = err.message.match(/execution reverted: (.+?)"/);
        if (revertReason && revertReason[1]) {
          setError(`Booking failed: ${revertReason[1]}`);
        } else {
          setError('Booking failed: Transaction reverted by the contract');
        }
      } else {
        setError('Booking failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setLoading(true);
    setError('');
    try {
      await contract.methods.cancelBooking(bookingId).send({ from: userAccount });
      loadBookings(contract, userAccount);
    } catch (err) {
      setError('Cancellation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async (preferredDate, preferredLocation, preferredVenue) => {
    setLoading(true);
    setError('');
    try {
      const testDateTimestamp = Math.floor(preferredDate.getTime() / 1000);
      
      console.log('Joining waitlist with parameters:', {
        testDateTimestamp,
        preferredLocation,
        preferredVenue
      });

      // ETM gas
      const gasEstimate = await contract.methods.joinWaitlist(
        testDateTimestamp,
        preferredLocation || '',
        preferredVenue || ''
      ).estimateGas({ from: userAccount });

      console.log('Estimated gas:', gasEstimate.toString());

      // convert BigInt 
      const gasLimit = Math.floor(Number(gasEstimate.toString()) * 1.5).toString();

      const result = await contract.methods.joinWaitlist(
        testDateTimestamp,
        preferredLocation || '',
        preferredVenue || ''
      ).send({ 
        from: userAccount,
        gas: gasLimit
      });

      console.log('Waitlist join result:', result);
      alert('Successfully joined the waitlist!');
      await loadWaitlistEntries(contract, userAccount);
    } catch (err) {
      console.error('Failed to join waitlist:', err);
  
      let errorMessage = err.message;
      if (err.message.includes('revert')) {
        const match = err.message.match(/revert(.*)/);
        errorMessage = match ? match[1].trim() : err.message;
      }
      setError('Failed to join waitlist: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadWaitlistEntries = async (contractInstance, account) => {
    setLoading(true);
    try {
      console.log('Loading waitlist entries for account:', account);

      // ETM gas
      const gasEstimate = await contractInstance.methods.getUserWaitlistEntries(account)
        .estimateGas({ from: account });

      console.log('Estimated gas for getUserWaitlistEntries:', gasEstimate.toString());

      const gasLimit = Math.floor(Number(gasEstimate.toString()) * 1.5).toString();

      const entries = await contractInstance.methods.getUserWaitlistEntries(account)
        .call({
          from: account,
          gas: gasLimit
        });
      
      console.log('Raw waitlist entries from contract:', entries);
      
      // check each
      entries.forEach((entry, index) => {
        console.log(`Entry ${index}:`, {
          testDate: new Date(Number(entry.testDate) * 1000).toLocaleString(),
          preferredLocation: entry.preferredLocation,
          preferredVenue: entry.preferredVenue,
          candidate: entry.candidate
        });
      });
  
      const formattedEntries = entries.map(entry => ({
        testDate: new Date(Number(entry.testDate) * 1000),
        preferredLocation: entry.preferredLocation,
        preferredVenue: entry.preferredVenue
      }));
      
      console.log('Formatted waitlist entries:', formattedEntries);
      setWaitlistEntries(formattedEntries);
    } catch (err) {
      console.error('Error loading waitlist entries:', err);
      setError('Error loading waitlist entries: ' + err.message);
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
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Your Waitlist Entries</h2>
                <WaitlistList entries={waitlistEntries} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;