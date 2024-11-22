'use client'
import React from 'react';
import TokenDisplay from '@/components/TokenDisplay/TokenDisplay';
import Header from '@/components/Header/Header';
import TableReservationstatus from '@/components/TableReservation/TableReservationstatus';
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
