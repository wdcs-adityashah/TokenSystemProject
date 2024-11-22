'use client'
import React from 'react';
import TokenDisplay from '@/components/TokenDisplay';
import Header from '@/components/Header';
import TableReservationstatus from '@/components/TableReservationstatus';
const Dashboard = () => {

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
