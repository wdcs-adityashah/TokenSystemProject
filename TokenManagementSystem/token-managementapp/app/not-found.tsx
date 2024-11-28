'use client'; // Mark as client-side for hooks to work
import React from 'react';
import { useRouter } from 'next/navigation'; // Updated import for Next.js 14

const NotFound: React.FC = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/'); // Redirect to the home/login page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-lg text-gray-700">
        Sorry, the page you are looking for does not exist.
      </p>
      <button
        onClick={handleRedirect}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
      >
        Go to Home Page
      </button>
    </div>
  );
};

export default NotFound;
