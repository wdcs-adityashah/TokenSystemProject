'use client';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header/Header';

interface OrderData {
  itemName: string;
  price: number;
  quantity: number;
  timestamp?: string; // Make timestamp optional
  quantityUnit?: string; // Add this to hold the unit of quantity
}

const OrderList = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);

  const loadOrders = () => {
    const allOrders: OrderData[] = [];
    const today = new Date().toISOString().split('T')[0];
  
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
  
      if (key && key.startsWith('orders_')) {
        const userOrders: OrderData[] = JSON.parse(localStorage.getItem(key) || '[]');
        const todayOrders = userOrders.filter(order => order.timestamp && order.timestamp.startsWith(today));
        console.log("Today's orders:", todayOrders);
        allOrders.push(...todayOrders); 
      }
    }
  
    console.log("All today's orders loaded:", allOrders); // Debugging log
    setOrders(allOrders);
  };

  useEffect(() => {
    loadOrders();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith('orders_')) {
        loadOrders(); // Reload orders when local storage changes
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const totalOrders = orders.length;
  const totalSum = orders.reduce((acc, order) => acc + order.price * order.quantity, 0);

  return (
    <div>
      <Header />
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Total Orders: {totalOrders}</h3>
        <ul className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <li key={index} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-md shadow">
                <div>
                  <span className="font-semibold text-lg">{order.itemName}</span>
                  <span className="text-gray-600"> - {order.quantity} {order.quantityUnit}</span> {/* Display quantity with unit */}
                </div>
                <div className="text-gray-600">
                  Total: ₹{order.price * order.quantity}
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 bg-white border border-gray-200 rounded-md shadow">
              <span className="text-gray-600">No orders found.</span>
            </li>
          )}
        </ul>
      </div>
      <h4 className="text-lg font-semibold mb-4 align-right px-5">Total Profit: ₹{totalSum}</h4>
    </div>
  );
};

export default OrderList;
