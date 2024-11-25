'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client'; // Import Socket type

const UserDetails = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); // State for password
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null); // Define socket type

  useEffect(() => {
    // Initialize the socket connection
    const newSocket = io('http://localhost:2000'); // Replace with your server URL
    setSocket(newSocket);

    // Clean up the socket connection on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name === '' || email === '' || password === '') { // Check for password
      setError('Please fill in all fields');
      return;
    } else {
      localStorage.setItem('user', JSON.stringify({ name, email }));
      router.push('/order');
    }
  };

  const handleUser   = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name === '' || email === '' || password === '') {
      setError('Please fill in all fields');
      return;
    } else {
      const response = await fetch('http://localhost:2000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
  
      const data = await response.json();
      console.log('API Response:', data); // Log the response
  
      if (response.ok) {
        // Check if data.session and data.session.user are defined
        if (data.session && data.session.user) {
          localStorage.setItem('user', JSON.stringify({ name: data.session.user.name, email: data.session.user.email }));
  
          // Emit the userId to Socket.IO only if socket is defined
          if (socket) {
            socket.emit('register', data.userId);
          } else {
            console.error('Socket is not initialized');
          }
          router.push('/table'); // Redirect to the /table page
        } else {
          console.error('User  data is not available in the response:', data);
          setError('Registration successful, but user data is not available.');
        }
      } else {
        console.error('Registration failed:', data.message);
        setError(data.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">User  Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text" // Change type to "text" for name
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password" // Add password input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Register as User on Local
          </button>
          <button
            type="button" // Change type to "button" to prevent form submission
            onClick={handleUser }
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Register as User on Hotel
          </button>
          <span style={{cursor:'pointer'}} className='inline-block mt-3' onClick={()=>router.push('/login')}>Already have an account</span>
        </form>
      </ div>
    </div>
  );
};

export default UserDetails;