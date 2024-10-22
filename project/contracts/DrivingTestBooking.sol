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
    event DebugWaitlistEntry(uint256 date, address user, string location, string venue);
    event WaitlistOperationDebug(uint256 dateKey, uint256 originalDate, uint256 currentLength);


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
        // 统计条目数量
        uint256 totalEntries = 0;
        uint256 startDate = block.timestamp - (block.timestamp % 86400); // 从今天开始
        uint256 endDate = startDate + (730 days); // 查找未来两年
        
        for (uint256 date = startDate; date <= endDate; date += 86400) {
            for (uint i = 0; i < waitlists[date].length; i++) {
                if (waitlists[date][i].candidate == _user) {
                    totalEntries++;
                }
            }
        }
        
        // 创建结果数组
        WaitlistEntry[] memory result = new WaitlistEntry[](totalEntries);
        uint256 resultIndex = 0;
        
        // 填充结果数组
        for (uint256 date = startDate; date <= endDate; date += 86400) {
            for (uint i = 0; i < waitlists[date].length; i++) {
                if (waitlists[date][i].candidate == _user) {
                    result[resultIndex] = waitlists[date][i];
                    resultIndex++;
                }
            }
        }
        
        return result;
    }

    function joinWaitlist(uint256 _testDate, string memory _preferredLocation, string memory _preferredVenue) public onlyRegistered {
        require(_testDate > block.timestamp, "Test date must be in the future");
        
      
        uint256 dateKey = _testDate - (_testDate % 86400);
        
        // 添加长度检查
        require(waitlists[dateKey].length < 100, "Waitlist for this date is full"); // 设置一个合理的上限
        
        // 记录debug信息
        emit WaitlistOperationDebug(dateKey, _testDate, waitlists[dateKey].length);
        
        // 检查用户是否已经在这个日期的候补列表中
        for(uint i = 0; i < waitlists[dateKey].length; i++) {
            require(waitlists[dateKey][i].candidate != msg.sender, "Already on waitlist for this date");
        }
        
        // 创建新的候补条目
        WaitlistEntry memory newEntry = WaitlistEntry({
            candidate: msg.sender,
            testDate: _testDate,
            preferredLocation: _preferredLocation,
            preferredVenue: _preferredVenue
        });
        
        // 添加到候补列表
        waitlists[dateKey].push(newEntry);
        
        // 发出事件
        emit AddedToWaitlist(msg.sender, _testDate, _preferredLocation, _preferredVenue);
    }

    // function joinWaitlist(uint256 _testDate, string memory _preferredLocation, string memory _preferredVenue) public onlyRegistered {
    //     if (_testDate <= block.timestamp) {
    //         revert FutureTimeRequired();
    //     }
        
    //     // 规范化日期到当天开始时间
    //     uint256 dateKey = _testDate - (_testDate % 86400);
        
    //     // 添加长度检查
    //     if (waitlists[dateKey].length >= 100) {
    //         revert WaitlistFull(dateKey);
    //     }
        
    //     // 检查用户是否已经在这个日期的候补列表中
    //     for(uint i = 0; i < waitlists[dateKey].length; i++) {
    //         if (waitlists[dateKey][i].candidate == msg.sender) {
    //             revert AlreadyOnWaitlist(dateKey);
    //         }
    //     }
        
    //     // 创建新的候补条目
    //     WaitlistEntry memory newEntry = WaitlistEntry({
    //         candidate: msg.sender,
    //         testDate: _testDate,
    //         preferredLocation: _preferredLocation,
    //         preferredVenue: _preferredVenue
    //     });
        
    //     // 添加到候补列表
    //     waitlists[dateKey].push(newEntry);
        
    //     // 发出事件
    //     emit AddedToWaitlist(msg.sender, _testDate, _preferredLocation, _preferredVenue);
    // }
}