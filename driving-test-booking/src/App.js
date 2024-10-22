import React, { useState, useEffect } from 'react';
import EthereumAuth from './components/auth/EthereumAuth';
import BookingForm from './components/booking/BookingForm';
import BookingList from './components/booking/BookingList';
import WaitlistSection from './components/booking/WaitlistSection';
import WaitlistList from './components/booking/WaitlistList';
import Logo from './components/common/Logo'; 


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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* navi */}
      {/* <nav className="bg-[#222222] shadow-sm mb-6"> */}
      <nav className="bg-gray-800 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo />
              {/* hello */}
              <span className="ml-4 text-gray-300 hidden md:block">
                Kia Ora
              </span>
            </div>
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  Connected: {userAccount.slice(0, 6)}...{userAccount.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* main */}
      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* left */}
            <div className="lg:w-2/3">
              <div className="bg-white shadow-lg rounded-3xl overflow-hidden relative">
                {/* bg */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00247D]/5 to-[#CC142B]/5"></div>
                <div className="relative p-6">
                  {!isAuthenticated ? (
                    <>
                      <div className="flex justify-center mb-6">
                        <img
                          src="/silver-fern.svg"
                          alt="Silver Fern"
                          className="h-12 w-auto"
                        />
                      </div>
                      <h1 className="text-2xl font-semibold mb-3 text-center">
                        Welcome to ChainBooking
                      </h1>
                      <p className="text-gray-600 text-center mb-2">
                        New Zealand's Blockchain-Based Driving Test Booking System
                      </p>
                      <p className="text-gray-500 text-sm text-center mb-6">
                        Te pūnaha whakarite whakamātautau taraiwa
                      </p>
                      <EthereumAuth onLogin={handleLogin} onError={setError} />
                    </>
                  ) : (
                    <div>
                      <div className="flex items-center mb-4">
                        <p className="text-lg">Kia Ora, </p>
                        <p className="ml-2 text-gray-600">{userAccount}</p>
                      </div>
                      <BookingForm onSubmit={handleBooking} loading={loading} />
                      {error && <p className="text-red-500 mt-4">{error}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* right */}
            {isAuthenticated && (
              <div className="lg:w-1/3 space-y-6">
                <div className="bg-white shadow-lg rounded-3xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
                    <BookingList bookings={bookings} onCancel={handleCancelBooking} />
                  </div>
                </div>

                <div className="bg-white shadow-lg rounded-3xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Waitlist</h2>
                    <WaitlistSection onJoinWaitlist={handleJoinWaitlist} loading={loading} />
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Your Waitlist Entries</h3>
                      <WaitlistList entries={waitlistEntries} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* foot */}
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">ChainBooking</h3>
              <p className="text-sm text-gray-300 hover:text-gray-200">
                New Zealand's Blockchain-Based Driving Test Booking System
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Contact</h3>
              <p className="text-sm text-gray-300">
                Email: <a href="mailto:info@chainbooking.co.nz" className="hover:text-gray-200">info@chainbooking.co.nz</a><br />
                Phone: <span className="hover:text-gray-200">0800 BOOKING</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Official Links</h3>
              <ul className="text-sm text-gray-300">
                <li>
                  <a 
                    href="https://www.nzta.govt.nz" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-gray-200 transition-colors duration-200"
                  >
                    NZTA Website
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.drivingtests.co.nz" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-gray-200 transition-colors duration-200"
                  >
                    Practice Tests
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">ChainBooking © {new Date().getFullYear()}</p>
            <p className="mt-1 text-sm text-gray-400 hover:text-gray-300">
              Proudly made in Aotearoa New Zealand
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;