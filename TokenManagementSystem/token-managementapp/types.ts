// types.ts
export interface MenuItem {
    _id: string;
    itemName: string;
    price: number;
}

export interface Token {
    _id: string;
    tokenNumber: number;
    menuItems: MenuItem[]; // Array of MenuItem
    status: string;
}

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { fetchMenuItems } from '@/utils/api';
// import { useRouter } from 'next/navigation';
// import { saveOrder, loadUserOrders, deleteOrder, OrderData } from '@/utils/OrderUtils';
// import axios from 'axios'; // Import axios if not already

// interface MenuItem {
//   _id: string;
//   itemName: string;
//   price: number;
//   quantity: string; // Added to specify unit like "grams" or "pieces"
// }

// const Order = () => {
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
//   const [orders, setOrders] = useState<OrderData[]>([]);
//   const [userName, setUserName] = useState<string | null>(null);
//   const router = useRouter();
//   const [completedTokens, setCompletedTokens] = useState<number[]>([]);

//   // WebSocket connection for token updates
//   useEffect(() => {
//     const ws = new WebSocket('ws://localhost:2000'); // Adjust the port if necessary

//     ws.onopen = () => {
//       console.log("WebSocket connection established"); // Debugging connection
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("WebSocket message received:", data); // Log incoming data for debugging

//       // Ensure you check if tokenNumber exists in the data
//       if (data.status === 'completed' && data.tokenNumber) {
//           setCompletedTokens((prev) => [...prev, data.tokenNumber]);
//       }
//     };

//     ws.onclose = () => {
//       console.log("WebSocket connection closed"); // Debugging disconnection
//     };

//     return () => {
//       ws.close();
//     };
//   }, []);

//   useEffect(() => {
//     const loadMenuItems = async () => {
//       try {
//         const items = await fetchMenuItems();
//         setMenuItems(items);
//       } catch (error) {
//         console.error("Failed to fetch menu items:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadMenuItems();

//     const loadedUser = localStorage.getItem('user');
//     if (loadedUser) {
//       const parsedUser = JSON.parse(loadedUser);
//       setUserName(parsedUser.name);
//       setOrders(loadUserOrders(parsedUser.name));
//     }
//   }, []);

//   const handleOrder = (item: MenuItem) => {
//     if (!userName) return;

//     const qty = quantity[item._id] || 1; // Default to 1 if no quantity provided
//     const existingOrderIndex = orders.findIndex(order => order.itemName === item.itemName);
    
//     const newOrder: OrderData = {
//       itemId: item._id, // Add itemId here
//       itemName: item.itemName,
//       price: item.price,
//       quantity: qty,
//       quantityUnit: item.quantity
//     };

//     if (existingOrderIndex > -1) {
//       // Update existing order
//       const updatedOrders = [...orders];
//       updatedOrders[existingOrderIndex].quantity += qty; // Aggregate quantity
//       setOrders(updatedOrders);
//       saveOrder(userName, updatedOrders[existingOrderIndex]);
//       alert("Quantity updated successfully!");
//     } else {
//       const confirmOrder = confirm(`Add ${item.itemName} (Quantity: ${qty} ${item.quantity}) to your order?`);
//       if (confirmOrder) {
//         setOrders([...orders, newOrder]);
//         saveOrder(userName, newOrder);
//         alert("Item added to your order successfully!");
//       } else {
//         alert("Order cancelled.");
//       }
//     }
//   };

//   const handleCancelOrder = (index: number) => {
//     if (userName) {
//       deleteOrder(userName, index);
//       setOrders(loadUserOrders(userName));
//       alert("Order cancelled successfully!");
//     }
//   };

//   const handleLogout = async () => {
//     if (!orders || orders.length === 0) {
//       alert("No orders to complete.");
//       return;
//     }
  
//     const menuItemIds = orders.map(order => order.itemId);

//     try {
//       const response = await axios.post('http://localhost:2000/api/tokens', { menuItemIds });
//       if (response.status === 201) {
//         const newToken = response.data;
//         alert(`Your order is complete. Token #${newToken.tokenNumber} generated.`);
//         router.push('/');
//       }
//     } catch (error) {
//       console.error("Failed to create token:", error);
//       alert("Failed to create token. Please try again.");
//     }
//   };



//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       <div className="flex justify-between items-center mb-4">
//         {userName && <h2 className="text-xl font-bold">Welcome, {userName}!</h2>}
//         <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300">
//           Complete Order & Generate Token
//         </button>
//       </div>

//       <h2 className="text-2xl font-bold text-center mb-6">Place Your Order</h2>

//       <ul className="space-y-4">
//         {menuItems.map((item) => (
//           <li key={item._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-md shadow hover:shadow-lg transition duration-200">
//             <div>
//               <span className="font-semibold text-lg">{item.itemName}</span>
//               <span className="text-gray-600"> - ₹{item.price} per {item.quantity}</span>
//             </div>
//             <input
//               type="number"
//               min="1"
//               placeholder="Quantity"
//               className="border border-gray-300 p-2 rounded w-20 mr-2"
//               value={quantity[item._id] || 1}
//               onChange={(e) => {
//                 const qty = parseInt(e.target.value, 10);
//                 setQuantity({ ...quantity, [item._id]: qty });
//               }}
//             />
//             <button
//               className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-300"
//               onClick={() => handleOrder(item)}
//             >
//               Add to Order
//             </button>
//           </li>
//         ))}
//       </ul>

//       <h3 className="text-xl font-bold mt-6">Your Current Order:</h3>
//       <ul className="mt-4">
//         {orders.length === 0 ? (
//           <p>No items added yet.</p>
//         ) : (
//           orders.map((order, index) => (
//             <li key={index} className="p-2 border-b border-gray-200 flex justify-between items-center">
//               {order.itemName} - ₹{order.price} x {order.quantity} {order.quantityUnit}
//               <button
//                 onClick={() => handleCancelOrder(index)}
//                 className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
//               >
//                 Cancel
//               </button>
//             </li>
//           ))
//         )}
//       </ul>

//       <h3 className="text-xl font-bold mt-6">Completed Tokens:</h3>
//       <ul className="list-disc list-inside mt-4">
//         {completedTokens.length === 0 ? (
//           <p>No completed tokens yet.</p>
//         ) : (
//           completedTokens.map((token) => (
//             <li key={token}>Token #{token} completed</li>
//           ))
//         )}
//       </ul>
//     </div>
//   );
// };

// export default Order;




// 'use client';
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// interface Token {
//   tokenNumber: number;
//   status: string;
// }

// const UserTokens = () => {
//   const [tokens, setTokens] = useState<Token[]>([]);
//   const [socket, setSocket] = useState<WebSocket | null>(null);

//   // Function to load tokens
//   const loadTokens = async () => {
//     try {
//       const response = await axios.get<Token[]>('http://localhost:2000/api/tokens');
//       console.log('API Response:', response.data); // Log the response
//       const activeTokens = response.data.filter(token => token.status !== 'completed');
//       setTokens(activeTokens);
//       localStorage.setItem('tokens', JSON.stringify(activeTokens));
//     } catch (error) {
//       console.error('Error fetching tokens:', error);
//     }
//   };
  

//   useEffect(() => {
//     loadTokens();
//     const intervalId = setInterval(loadTokens, 10000);

//     // Initialize WebSocket connection
//     const ws = new WebSocket('ws://localhost:2000');
//     setSocket(ws);

//     return () => {
//       clearInterval(intervalId);
//       ws.close();
//     };
//   }, []);

//   const handleCompleteToken = async (tokenNumber: number) => {
//     // Make an API request to update the token status in the database
//     try {
//       const response = await axios.patch('http://localhost:2000/api/tokens/update-status', {
//         tokenId: tokenNumber, // Assuming tokenNumber is the ID in your DB
//         status: 'completed',
//       });

//       if (response.status === 200) {
//         const updatedTokens = tokens
//           .map((token) => (token.tokenNumber === tokenNumber ? { ...token, status: 'completed' } : token));
//         setTokens(updatedTokens);
//         localStorage.setItem('tokens', JSON.stringify(updatedTokens));

//         // Send message to WebSocket
//         socket?.send(JSON.stringify({ tokenNumber, status: 'completed' }));

//         alert(`Token #${tokenNumber} completed and removed.`);
//       }
//     } catch (error) {
//       console.error('Error completing token:', error);
//       alert('Failed to complete the token. Please try again.');
//     }
//   };

//   return (
//     <div className="bg-gray-100 p-4 rounded-lg">
//       <h3 className="text-xl font-semibold mb-4">Active Tokens</h3>
//       <ul className="space-y-4">
//         {tokens.length === 0 ? (
//           <p>No active tokens available.</p>
//         ) : (
//           tokens.map((token) => (
//             <li key={token.tokenNumber} className="flex justify-between items-center p-3 bg-white shadow rounded">
//               <div>
//                 <span>Token #{token.tokenNumber}</span> - Status: {token.status}
//               </div>
//               {token.status !== 'completed' && (
//                 <button
//                   className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
//                   onClick={() => handleCompleteToken(token.tokenNumber)}
//                 >
//                   Mark as Completed
//                 </button>
//               )}
//             </li>
//           ))
//         )}
//       </ul>
//     </div>
//   );
// };

// export default UserTokens;



