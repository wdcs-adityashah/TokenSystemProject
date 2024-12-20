// Header.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // Import js-cookie to manage cookies

const Header = () => {
  const router = useRouter();
  const handlelogout = () => {
    Cookies.remove('token'); // Correctly remove the token from cookies
    router.push('/adminlogin');
  }
  return (
    <header className="bg-blue-600 text-white py-4 px-8 flex justify-between items-center shadow-md">
      <Link href={'/dashboard'} className="text-2xl font-semibold">Admin Dashboard</Link>
      <nav className='flex gap-5'>
        <Link href="/orderlist" className="text-lg font-medium hover:text-gray-200 transition-colors">
          Total Orders
        </Link>
        <Link href={"/menulist"} className="text-lg font-medium hover:text-gray-200 transition-colors">
           Menu Management
        </Link>
        <Link href="/Tableorders" className="text-lg font-medium hover:text-gray-200 transition-colors">
        TableOrders
        </Link>
        <Link href="/Totaluser" className="text-lg font-medium hover:text-gray-200 transition-colors">
        Total User
        </Link>
        <button onClick={handlelogout} className="text-lg font-medium hover:text-gray-200 transition-colors">
          LogOut 
        </button>
        
      </nav>
    </header>
  );
};

export default Header;
