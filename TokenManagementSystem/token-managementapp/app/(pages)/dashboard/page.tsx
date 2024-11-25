'use client'
import React,{useEffect} from 'react';
import { useRouter } from 'next/navigation';
import TokenDisplay from '@/components/TokenDisplay/TokenDisplay';
import Header from '@/components/Header/Header';
import TableReservationstatus from '@/components/TableReservation/TableReservationstatus';
const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/adminlogin');
    }
  }, [router]);
  return (
    <div>
      <Header/>
      {/* Other components */}
      <TokenDisplay />
      <TableReservationstatus/>
    </div>
  );
};

export default Dashboard;
