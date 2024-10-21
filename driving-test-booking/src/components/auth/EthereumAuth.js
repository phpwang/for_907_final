import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../../constants/contract';

const EthereumAuth = ({ onLogin, onError }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          
          const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
          
          const registered = await contractInstance.methods.registeredUsers(accounts[0]).call();
          setIsRegistered(registered);

          if (registered) {
            onLogin(accounts[0]);
          }
        } catch (error) {
          setError('Failed to connect to Ethereum wallet: ' + error.message);
          onError('Failed to connect to Ethereum wallet: ' + error.message);
        }
      } else {
        setError('Ethereum wallet not detected. Please install MetaMask.');
        onError('Ethereum wallet not detected. Please install MetaMask.');
      }
    };

    initWeb3();
  }, [onLogin, onError]);

  const handleRegister = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      await contract.methods.registerUser().send({ from: account });
      setIsRegistered(true);
      onLogin(account);
    } catch (error) {
      setError('Registration failed: ' + error.message);
      onError('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!account) {
    return <div>Connecting to Ethereum wallet...</div>;
  }

  if (!isRegistered) {
    return (
      <div className="text-center">
        <p className="mb-4">Welcome! You need to register before using the app.</p>
        <button 
          onClick={handleRegister} 
          disabled={loading} 
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="mb-4">Connected with address: {account}</p>
      <button 
        onClick={() => onLogin(account)} 
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Enter App
      </button>
    </div>
  );
};

export default EthereumAuth;