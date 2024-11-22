// Header.tsx
'use client';
import React from 'react';
import Link from 'next/link';

const Header = () => {
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
        <Link href={"/billgenerated"} className="text-lg font-medium hover:text-gray-200 transition-colors">
          Invoices 
        </Link>
        <Link href={"/billgenerated"} className="text-lg font-medium hover:text-gray-200 transition-colors">
          Git Test 
        </Link>
      </nav>
    </header>
  );
};

export default Header;
