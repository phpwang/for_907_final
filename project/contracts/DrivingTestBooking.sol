// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DrivingTestBooking {
    struct Booking {
        address candidate;
        uint256 testDate;
        string location;
        string venue;
        bool isActive;
    }

    struct WaitlistEntry {
        address candidate;
        uint256 testDate;
        string preferredLocation;
        string preferredVenue;
    }

    mapping(uint256 => Booking) public bookings;
    uint256 public nextBookingId;

    //mapping(uint256 => WaitlistEntry[]) public waitlists;
    mapping(uint256 => WaitlistEntry[]) public waitlists;



    mapping(address => bool) public registeredUsers;

    event UserRegistered(address user);
    event BookingCreated(uint256 bookingId, address candidate, uint256 testDate, string location, string venue);
    event BookingCancelled(uint256 bookingId);
    event AddedToWaitlist(address candidate, uint256 testDate, string preferredLocation, string preferredVenue);
    event MovedFromWaitlist(address candidate, uint256 bookingId, uint256 testDate, string location, string venue);

    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User is not registered");
        _;
    }

    function registerUser() public {
        require(!registeredUsers[msg.sender], "User is already registered");
        registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    function createBooking(uint256 _testDate, string memory _location, string memory _venue) public onlyRegistered {
        require(_testDate > block.timestamp, "Test date must be in the future");

        uint256 bookingId = nextBookingId++;
        bookings[bookingId] = Booking(msg.sender, _testDate, _location, _venue, true);

        emit BookingCreated(bookingId, msg.sender, _testDate, _location, _venue);
    }

    function cancelBooking(uint256 _bookingId) public onlyRegistered {
        require(bookings[_bookingId].candidate == msg.sender, "Only the booking owner can cancel");
        require(bookings[_bookingId].isActive, "Booking is not active");
        
        bookings[_bookingId].isActive = false;
        emit BookingCancelled(_bookingId);
        
        uint256 testDate = bookings[_bookingId].testDate;
        string memory location = bookings[_bookingId].location;
        string memory venue = bookings[_bookingId].venue;
        
        if (waitlists[testDate].length > 0) {
            for (uint i = 0; i < waitlists[testDate].length; i++) {
                WaitlistEntry memory entry = waitlists[testDate][i];
                bool matchLocation = keccak256(bytes(entry.preferredLocation)) == keccak256(bytes("")) || 
                                    keccak256(bytes(entry.preferredLocation)) == keccak256(bytes(location));
                bool matchVenue = keccak256(bytes(entry.preferredVenue)) == keccak256(bytes("")) || 
                                keccak256(bytes(entry.preferredVenue)) == keccak256(bytes(venue));
                
                if (matchLocation && matchVenue) {
                    bookings[_bookingId] = Booking(entry.candidate, testDate, location, venue, true);
                    removeFromWaitlist(testDate, i);
                    emit MovedFromWaitlist(entry.candidate, _bookingId, testDate, location, venue);
                    return;
                }
            }
            
            // If no preferred match found, assign to the first person in the waitlist
            WaitlistEntry memory firstEntry = waitlists[testDate][0];
            bookings[_bookingId] = Booking(firstEntry.candidate, testDate, location, venue, true);
            removeFromWaitlist(testDate, 0);
            emit MovedFromWaitlist(firstEntry.candidate, _bookingId, testDate, location, venue);
        }
    }

    function joinWaitlist(uint256 _testDate, string memory _preferredLocation, string memory _preferredVenue) public onlyRegistered {
        require(_testDate > block.timestamp, "Test date must be in the future");
        waitlists[_testDate].push(WaitlistEntry(msg.sender, _testDate, _preferredLocation, _preferredVenue));
        emit AddedToWaitlist(msg.sender, _testDate, _preferredLocation, _preferredVenue);
    }

    function getBooking(uint256 _bookingId) public view returns (address, uint256, string memory, string memory, bool) {
        Booking memory booking = bookings[_bookingId];
        return (booking.candidate, booking.testDate, booking.location, booking.venue, booking.isActive);
    }

    function getWaitlistLength(uint256 _testDate) public view returns (uint256) {
        return waitlists[_testDate].length;
    }

    function removeFromWaitlist(uint256 _testDate, uint256 _index) internal {
        require(_index < waitlists[_testDate].length, "Index out of bounds");
        for (uint i = _index; i < waitlists[_testDate].length - 1; i++) {
            waitlists[_testDate][i] = waitlists[_testDate][i + 1];
        }
        waitlists[_testDate].pop();
    }

    function getUserWaitlistEntries(address _user) public view returns (WaitlistEntry[] memory) {
        uint256 count = 0;
        for (uint256 date = block.timestamp; date < block.timestamp + 365 days; date += 1 days) {
            for (uint i = 0; i < waitlists[date].length; i++) {
                if (waitlists[date][i].candidate == _user) {
                    count++;
                }
            }
        }

        WaitlistEntry[] memory userEntries = new WaitlistEntry[](count);
        uint256 index = 0;
        for (uint256 date = block.timestamp; date < block.timestamp + 365 days; date += 1 days) {
            for (uint i = 0; i < waitlists[date].length; i++) {
                if (waitlists[date][i].candidate == _user) {
                    userEntries[index] = waitlists[date][i];
                    index++;
                }
            }
        }

        return userEntries;
    }
}