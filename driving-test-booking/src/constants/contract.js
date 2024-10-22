export const CONTRACT_ADDRESS = '0x0976bCA030c558dE0D08DE82530026374C929f4e';

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "testDate",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "preferredLocation",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "preferredVenue",
        "type": "string"
      }
    ],
    "name": "AddedToWaitlist",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bookingId",
        "type": "uint256"
      }
    ],
    "name": "BookingCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bookingId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "testDate",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "venue",
        "type": "string"
      }
    ],
    "name": "BookingCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "venue",
        "type": "string"
      }
    ],
    "name": "DebugWaitlistEntry",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bookingId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "testDate",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "venue",
        "type": "string"
      }
    ],
    "name": "MovedFromWaitlist",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dateKey",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "originalDate",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "currentLength",
        "type": "uint256"
      }
    ],
    "name": "WaitlistOperationDebug",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bookings",
    "outputs": [
      {
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "testDate",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "venue",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "nextBookingId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "registeredUsers",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "waitlists",
    "outputs": [
      {
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "testDate",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "preferredLocation",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "preferredVenue",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_testDate",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_venue",
        "type": "string"
      }
    ],
    "name": "createBooking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_bookingId",
        "type": "uint256"
      }
    ],
    "name": "cancelBooking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_bookingId",
        "type": "uint256"
      }
    ],
    "name": "getBooking",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_testDate",
        "type": "uint256"
      }
    ],
    "name": "getWaitlistLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserWaitlistEntries",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "candidate",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "testDate",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "preferredLocation",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "preferredVenue",
            "type": "string"
          }
        ],
        "internalType": "struct DrivingTestBooking.WaitlistEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_testDate",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_preferredLocation",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_preferredVenue",
        "type": "string"
      }
    ],
    "name": "joinWaitlist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];