'use client'
import React,{useRef,useState,useEffect} from "react";
import { io, Socket } from "socket.io-client";
import Order from "@/app/(pages)/order/page";


interface Order {
  userId: string;
  tableNumber: number;
  items: { itemName: string; price: number; quantity: number }[];
  totalAmount: number;
}

const TableOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
      const fetchOrders = async () => {
          const response = await fetch('http://localhost:2000/api/tableorder');
          const data = await response.json();
          setOrders(data);
      };

      fetchOrders();

      // Initialize socket connection
      socket.current = io("http://localhost:2000");

      // Listen for new orders
      socket.current.on("new-order", (data: Order) => {
          console.log("Received order:", data);
          setOrders((prevOrders) => [...prevOrders, data]);
      });

      // Cleanup function to disconnect the socket when the component unmounts
      return () => {
          socket.current?.disconnect();
      };
  }, []); // Empty dependency array to run this effect only once on mount

  return (
      <div className="overflow-x-auto mb-8">
          <h2 className="text-xl font-bold mb-4">Orders Overview</h2>
          {orders.length === 0 ? (
              <p>No orders yet.</p>
          ) : (
              <ul>
                  {orders.map((order, index) => (
                      <li key={index} className="border-b py-2">
                          <h3 className="font-semibold">Table {order.tableNumber}:</h3>
                          <p>User ID: {order.userId}</p>
                          <p>Total Amount: ₹{order.totalAmount}</p>
                          <ul>
                              {order.items.length > 0 ? (
                                  order.items.map((item, itemIndex) => (
                                      <li key={itemIndex}>
                                          {item.itemName} - ₹{item.price} x {item.quantity}
                                      </li>
                                  ))
                              ) : (
                                  <li>No items ordered.</li>
                              )}
                          </ul>
                      </li>
                  ))}
              </ul>
          )}
      </div>
  );
};

export default TableOrders;


