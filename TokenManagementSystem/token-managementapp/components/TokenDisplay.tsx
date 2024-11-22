import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Token {
  _id: string;
  tokenNumber: number;
  status: string;
  date: string;
}

const UserTokens = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const socketRef = React.useRef<Socket | null>(null);

  const loadTokens = async () => {
    try {
      const response = await axios.get<Token[]>('http://localhost:2000/api/tokens');
      setTokens(response.data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  useEffect(() => {
    loadTokens();

    // Create socket connection
    socketRef.current = io('http://localhost:2000');

    console.log('Socket connected:', socketRef.current.id);

    // Listen for new token events
    socketRef.current.on('new-token', (newToken) => {
      console.log('New token received:', newToken);
      console.log('New tokensds received:', newToken);

      // Add the new token to the state
      setTokens(prevTokens => [...prevTokens, newToken]);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, []); // Removed tokens from dependency array

  const handleCompleteToken = async (tokenId: string, tokenNumber: number) => {
    try {
      const response = await axios.patch('http://localhost:2000/api/tokens/update-status', {
        tokenId: tokenId,
        status: 'completed',
      });

      if (response.status === 200) {
        // Update the local state to reflect the completed status
        setTokens(prevTokens => prevTokens.filter(token => token._id !== tokenId));
        alert(`Token #${tokenNumber} marked as completed.`);
      }
    } catch (error) {
      console.error(' Error completing token:', error);
      alert('Failed to complete the token. Please try again.');
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Active Tokens</h3>
      <ul className="mt-4">
  {tokens.length === 0 ? (
    <p>No Active Tokens</p>
  ) : (
    tokens.filter(token => token.status === 'pending').map(token => (
      <li key={token._id} className={`p-2 border-b border-gray-200 flex justify-between items-center ${token.status === 'pending' ? 'bg-yellow-100' : 'bg-green-100'}`}>
        Token #{token.tokenNumber} - Status: {token.status}
        {token.status === 'pending' && (
          <button
            onClick={() => handleCompleteToken(token._id, token.tokenNumber)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Complete
          </button>
        )}
      </li>
    ))
  )}
</ul>
      
    </div>
  );
};

export default UserTokens;