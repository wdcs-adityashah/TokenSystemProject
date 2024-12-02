'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usercredentials } from '@/api/services/utils/api';
import Cookies from 'js-cookie'; // Install js-cookie package

const UserDetails = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await usercredentials(email, password);

      if (response.token) {
        // Store the token in a cookie
        Cookies.set('token', response.token, { expires: 7 }); // Expires in 7 days
        setMessage("Login successful");
        router.push('/dashboard'); // Redirect to dashboard
      } else {
        // Handle the case where the response does not include a token
        setMessage(response.message);
      }
    } catch (error) {
      console.error(error);
      // Remove the token in case of an error
      Cookies.remove('token'); // Remove token from cookie
      setMessage("An error occurred. Please try again.");
      router.push('/adminlogin'); // Redirect to admin login on error
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message === "Login successful" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserDetails;