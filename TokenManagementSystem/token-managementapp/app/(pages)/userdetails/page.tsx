'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
const UserDetails = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(name === ''  || email === ''){
        setError('Please fill the details'); 
    }
    else{
        localStorage.setItem('user',JSON.stringify({name,email}));
        router.push('/order');
    }
  };
  const handleUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if(name === ''  || email === ''){
        setError('Please fill the details'); 
    }
    else{
      localStorage.removeItem('orders');
      localStorage.removeItem('reservedTables');
          localStorage.setItem('user',JSON.stringify({name,email}));
        router.push('/table');
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">User Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="name"
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            type="submit"
            onClick={handleUser}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Register as User on Hotel
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDetails;