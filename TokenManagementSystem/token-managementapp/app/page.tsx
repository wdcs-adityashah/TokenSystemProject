'use client'
import React from 'react';
import Link from 'next/link';

const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Our Service</h1>
        <p className="text-gray-600 mb-8">Choose your role to continue:</p>

        <div className="space-y-4">
          <Link href={'/adminlogin'} className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300">
              Register as Admin
          </Link>
          <Link href={'/userdetails'} className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition duration-300">
              Register as a User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default App;
