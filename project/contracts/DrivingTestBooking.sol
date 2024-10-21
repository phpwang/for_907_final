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
    }

    mapping(uint256 => Booking) public bookings;
    uint256 public nextBookingId;

    mapping(uint256 => WaitlistEntry[]) public waitlists;

    mapping(address => bool) public registeredUsers;

    event UserRegistered(address user);
    event BookingCreated(uint256 bookingId, address candidate, uint256 testDate, string location, string venue);
    event BookingCancelled(uint256 bookingId);
    event AddedToWaitlist(address candidate, uint256 testDate);
    event MovedFromWaitlist(address candidate, uint256 bookingId, uint256 testDate);

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

    function cancelBooking(uint256 _bookingId) public {
        require(bookings[_bookingId].candidate == msg.sender, "Only the booking owner can cancel");
        require(bookings[_bookingId].isActive, "Booking is not active");
        require(registeredUsers[msg.sender], "User is not registered");

        bookings[_bookingId].isActive = false;
        emit BookingCancelled(_bookingId);

        // Check if there's anyone on the waitlist for this date
        uint256 testDate = bookings[_bookingId].testDate;
        if (waitlists[testDate].length > 0) {
            WaitlistEntry memory entry = waitlists[testDate][0];
            bookings[_bookingId] = Booking(entry.candidate, testDate, bookings[_bookingId].location, bookings[_bookingId].venue, true);

            // Remove the entry from the waitlist
            for (uint i = 0; i < waitlists[testDate].length - 1; i++) {
                waitlists[testDate][i] = waitlists[testDate][i + 1];
            }
            waitlists[testDate].pop();

            emit MovedFromWaitlist(entry.candidate, _bookingId, testDate);
        }
    }

    function joinWaitlist(uint256 _testDate) public onlyRegistered {
        require(_testDate > block.timestamp, "Test date must be in the future");
        waitlists[_testDate].push(WaitlistEntry(msg.sender, _testDate));
        emit AddedToWaitlist(msg.sender, _testDate);
    }

    function getBooking(uint256 _bookingId) public view returns (address, uint256, string memory, string memory, bool) {
        Booking memory booking = bookings[_bookingId];
        return (booking.candidate, booking.testDate, booking.location, booking.venue, booking.isActive);
    }

    function getWaitlistLength(uint256 _testDate) public view returns (uint256) {
        return waitlists[_testDate].length;
    }
}