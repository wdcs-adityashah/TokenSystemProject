'use client'
import React, { useEffect, useState, useRef } from 'react';
import { fetchMenuItems } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { saveOrder, loadUserOrders, deleteOrder, OrderData } from '@/utils/OrderUtils';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface MenuItem {
  _id: string;
  itemName: string;
  price: number;
  quantity: string; 
}

const Order = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null); // Create a ref for the socket
  const [notification, setNotification] = useState<string | null>(null); // State to hold notification message


  useEffect(() => {
    // Establish socket connection
    socketRef.current = io('http://localhost:2000');

    // Listen for token updated notifications
    socketRef.current.on('token-updated', (data) => {
        console.log('Token updated event received:', data); // Log the received data
        setNotification(`Token #${data.tokenNumber} is ready for collection!`); // Set notification message
    });

    return () => {
        socketRef.current?.disconnect(); // Cleanup on unmount
    };
}, []);
  // Load menu items and user data
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const items = await fetchMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();

    const loadedUser   = localStorage.getItem('user');
    if (loadedUser  ) {
      const parsedUser = JSON.parse(loadedUser);
      setUserName(parsedUser.name);
      setOrders(loadUserOrders(parsedUser?.name));
    }
  }, []);

  const handleOrder = (item: MenuItem) => {
    if (!userName) return;

    const qty = quantity[item._id] || 1; // Default to 1 if no quantity provided
    const existingOrderIndex = orders.findIndex(order => order.itemName === item.itemName);
    
    const newOrder: OrderData = {
      itemId: item._id,
      itemName: item.itemName,
      price: item.price,
      quantity: qty,
      quantityUnit: item.quantity
    };

    if (existingOrderIndex > -1) {
      // Update existing order
      const updatedOrders = [...orders];
      updatedOrders[existingOrderIndex].quantity += qty; // Aggregate quantity
      setOrders(updatedOrders);
      saveOrder(userName, updatedOrders[existingOrderIndex]);
      alert("Quantity updated successfully!");
    } else {
      const confirmOrder = confirm(`Add ${item.itemName} (Quantity: ${qty} ${item.quantity}) to your order?`);
      if (confirmOrder) {
        setOrders([...orders, newOrder]);
        saveOrder(userName, newOrder);
        alert("Item added to your order successfully!");
      } else {
        alert("Order cancelled.");
      }
    }
  };

  const handleCancelOrder = (index: number) => {
    if (userName) {
      deleteOrder(userName, index);
      setOrders(loadUserOrders(userName));
      alert("Order cancelled successfully!");
    }
  };


  const handleLogout = async () => {
    if (!orders || orders.length === 0) {
        alert("No orders to complete.");
        return;
    }

    try {
        const menuItemIds = orders.map(order => order.itemId);
        const response = await axios.post('http://localhost:2000/api/tokens', { menuItemIds });
        const token = response.data;
        alert(`Your order is complete. Token #${token.tokenNumber} generated.`);
        socketRef.current?.emit('new-token', token); // Emit the new token event
        router.push('/'); 
        } 
        catch (error) {
        console.error("Failed to create tokens:", error);
        alert("Failed to create tokens. Please try again.");
    }
};



  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {notification && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                {notification}
            </div>
        )}
      <div className="flex justify-between items-center mb-4">
        {userName && <h2 className="text-xl font-bold">Welcome, {userName}!</h2>}
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300">
          Complete Order & Generate Token
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">Place Your Order</h2>

      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-md shadow hover:shadow-lg transition duration-200">
            <div>
              <span className="font-semibold text-lg">{item.itemName}</span>
              <span className="text-gray-600"> - ₹{item.price} per {item.quantity}</span>
            </div>
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              className="border border-gray-300 p-2 rounded w-20 mr-2"
              value={quantity[item._id] || 1}
              onChange={(e) => {
                const qty = parseInt(e.target.value, 10);
                setQuantity({ ...quantity, [item._id]: qty });
              }}
            />
            <button
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-300"
              onClick={() => handleOrder(item)}
            >
              Add to Order
            </button>
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-bold mt-6">Your Current Order:</h3>
      <ul className="mt-4">
        {orders.length === 0 ? (
          <p>No items added yet.</p>
        ) : (
          orders.map((order, index) => (
            <li key={index} className="p-2 border-b border-gray-200 flex justify-between items-center">
              {order.itemName} - ₹{order.price} x {order.quantity} {order.quantityUnit}
              <button
                onClick={() => handleCancelOrder(index)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
              >
                Cancel
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Order;