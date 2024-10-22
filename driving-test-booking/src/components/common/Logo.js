import React from 'react';


const Logo = () => (
    <div className="flex items-center space-x-2">
      <div className="text-2xl font-bold">
        <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
          Chain
        </span>
        <span className="text-white">
          Booking
        </span>
      </div>
      <span className="text-sm text-gray-300 hidden md:inline">
        Powered by Blockchain
      </span>
    </div>
  );
  
  export default Logo;