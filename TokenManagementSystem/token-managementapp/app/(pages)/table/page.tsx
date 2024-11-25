'use client';
import React, { useEffect, useState, useRef } from 'react';
import { fetchMenuItems } from '@/api/services/utils/api';
import {  loadUserOrders, deleteOrder, OrderData } from '@/api/services/utils/OrderUtils';
import { io, Socket } from 'socket.io-client';
import Modal from '@/components/Modal/Modal';
import { useRouter } from 'next/navigation';
interface MenuItem {
  _id: string;
  itemName: string;
  price: number;
  quantity: string; 
}

interface TableItemProps {
  number: number; 
  isSelected: boolean;
  onClick: (number: number) => void;
}
interface Reservation {
  tableNumber: number;
  isReserved: boolean;
  userId:string;
}

const TableItem: React.FC<TableItemProps> = ({ number, isSelected, onClick }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center border rounded-md shadow p-4 m-2 transition duration-300 ${isSelected ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
      onClick={() => onClick(number)}
    >
      <h3 className="text-xl font-semibold">Table {number}</h3>
    </div>
  );
};

const Table = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
  const [orders, setOrders] = useState<{ [key: number]: OrderData[] }>({});
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null); 
  const [tables, setTables] = useState<number[]>(Array.from({ length: 10 }, (_, i) => i + 1));
  const [reservedTables, setReservedTables] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const router = useRouter();
  useEffect(() => {

    socketRef.current = io('http://localhost:2000');

    socketRef.current.on('table-reservation-updated', (data: Reservation) => {
      setReservedTables(prev => {
        const index = prev.indexOf(data.tableNumber);
        if (data.isReserved && index === -1) {
          const updatedTables = [...prev, data.tableNumber];
          localStorage.setItem('reservedTables', JSON.stringify(updatedTables));
          return updatedTables; // Update state with the new list of reserved tables
        } 
        else if (!data.isReserved && index > -1) {
          const updatedTables = prev.filter(table => table !== data.tableNumber);
          localStorage.setItem('reservedTables', JSON.stringify(updatedTables)); // Update localStorage
          return updatedTables; // Update state with the new list of reserved tables
        }
        return prev; // No change
      });
    });
    const fetchReservations = async () => {
      const response = await fetch('http://localhost:2000/api/tables/reservations');
      const data = await response.json();
      setReservations(data);
      setReservedTables(data.filter(reservation => reservation.isReserved).map(reservation => reservation.tableNumber));
    };

    fetchReservations();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);



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

    const loadedUser  = localStorage.getItem('user');
    if (loadedUser) {
        const parsedUser  = JSON.parse(loadedUser );
        setUserName(parsedUser?.name);
        const userOrders = loadUserOrders(parsedUser?.name);
        const ordersByTable: { [key: number]: OrderData[] } = {};
        userOrders.forEach(order => {
            if (order.tableNumber !== undefined && typeof order.tableNumber === 'number') {
              if (!ordersByTable[order.tableNumber]) {
                ordersByTable[order.tableNumber] = [];
              }
              ordersByTable[order.tableNumber].push(order);
            } else {
              console.warn(`Order with undefined or invalid tableNumber:`, order);
            }
          });
    
        setOrders(ordersByTable);
      }
      else{
        setOrders({});
        router.push('/login');
      }
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
  
    
  }, []);

  const handleIncrement = (itemId: string) => {
    setQuantity(prev => {
      const currentQty = prev[itemId] || 0;
      return { ...prev, [itemId]: currentQty + 1 }; // Increase by 1
    });
  };
  
  const handleDecrement = (itemId: string) => {
    setQuantity(prev => {
      const currentQty = prev[itemId] || 0;
      return { ...prev, [itemId]: Math.max(0, currentQty - 1) }; // Decrease by 1, but not below 0
    });
  };

  const handleOrder = async (tableNumber: number | null) => {
    if (!userName || selectedTable === null) return;

    const existingOrders = orders[selectedTable] || [];
    const existingOrdersMap: { [key: string]: OrderData } = existingOrders.reduce((acc, order) => {
        acc[order.itemId] = order;
        return acc;
    }, {} as { [key: string]: OrderData });

    menuItems.forEach(item => {
        const qty = quantity[item._id] || 0;
        if (qty > 0) {
            if (existingOrdersMap[item._id]) {
                existingOrdersMap[item._id].quantity = qty; // Set to the input value
            } else {
                const newOrder: OrderData = {
                    itemId: item._id,
                    itemName: item.itemName,
                    price: item.price,
                    quantity: qty,
                    quantityUnit: item.quantity,
                    tableNumber: selectedTable
                };
                existingOrdersMap[item._id] = newOrder; 
            }
        }
    });

    const updatedOrders = Object.values(existingOrdersMap);
    
    setOrders(prevOrders => ({
        ...prevOrders,
        [selectedTable]: updatedOrders
    }));

    localStorage.setItem('orders', JSON.stringify({ ...orders, [selectedTable]: updatedOrders }));

    setModalTitle("Success");
    setModalMessage("Items added to your order successfully!");
    setModalOpen(true);

    try {
        const response = await fetch('http://localhost:2000/api/tables/reserve-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tableNumber: selectedTable, isProcessed: true, userId: userName }), // Ensure to include isProcessed and userId
        });

        if (!response.ok) {
            console.error('Failed to update reservation status');
            setModalTitle("Error");
            setModalMessage("Failed to update reservation status.");
            setModalOpen(true);
            return;
        }

        const data: Reservation = await response.json();      
        socketRef.current?.emit('table-reservation-updated', data);
    } catch (error) {
        console.error("Failed to complete order:", error);
        setModalTitle("Error");
        setModalMessage("Failed to complete order. Please try again.");
    }
};
  
  const handleCancelOrder = (index: number) => {
    if (userName && selectedTable !== null) {
      const currentOrders: OrderData[] = orders[selectedTable] || [];
      
      if (index >= 0 && index < currentOrders.length) {
        const orderToDelete = currentOrders[index];

        const updatedOrders = currentOrders.filter((_, i) => i !== index);

        setOrders(prevOrders => {
          const updatedState = {
            ...prevOrders,
            [selectedTable]: updatedOrders
          };
          localStorage.setItem('orders', JSON.stringify(updatedState)); 
          return updatedState;
        });
        const itemIdAsNumber = Number(orderToDelete.itemId);
        deleteOrder(userName, itemIdAsNumber); 
        setModalTitle("Success");
        setModalMessage("Order cancelled successfully!");
        setModalOpen(true);
      } else {
        setModalTitle("Error");
        setModalMessage("Invalid order index.");
        setModalOpen(true);
      }
    }
  };


  const handleCompleteOrder = async (tableNumber: number | null) => {
    if (tableNumber === null) {
      setModalTitle("Error");
      setModalMessage("No table selected.");
      setModalOpen(true);
      return;
    }

    if (!orders[tableNumber] || orders[tableNumber].length === 0) {
      setModalTitle("Error");
      setModalMessage("No orders to complete.");
      setModalOpen(true);
      return;
    }

    try {
      setModalTitle("Success");
      setModalMessage(`Order is ready for Table ${tableNumber}.`);
      const response = await fetch('http://localhost:2000/api/tables/reserve-table', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableNumber, isReserved: true }),
      });
      
      if (!response.ok) {
          console.error('Failed to update reservation status');
          return;
      }
      const data: Reservation = await response.json();      
      socketRef.current?.emit('table-reservation-updated', data);
    } catch (error) {
      console.error("Failed to complete order:", error);
      setModalTitle("Error");
      setModalMessage("Failed to complete order. Please try again.");
      setModalOpen(true);
    }
  };


  const handleLogout = () => {
    // Emit a logout event
    socketRef.current?.emit('user-logout', { userName });
    localStorage.removeItem('orders');
    localStorage.removeItem('reservedTables');
    localStorage.removeItem('user');
    setOrders({});
    setReservedTables([]);
    setSelectedTable(null);
    setUserName(null);
    setQuantity({}); // Reset quantity

    router.push('/userdetails');
};


  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    const existingOrders = orders[tableNumber] || [];
    setOrders(prevOrders => ({ ...prevOrders, [tableNumber]: existingOrders }));
    setQuantity({});

  };
  const handleGenerateInvoice = () => {
    if (selectedTable !== null) {
      const order = orders[selectedTable];
      if (order && order.length > 0) {
        // Calculate total amount
        const totalAmount = order.reduce((total, o) => total + (o.price * o.quantity), 0);
        
        // Create formatted invoice details
        const invoiceDetails = order.map(o => (
          <div key={o.itemId}>
            {o.itemName} - ₹{o.price} x {o.quantity} {o.quantityUnit}
          </div>
        ));
  
        // Add spacing and total amount
        const formattedInvoice = (
          <div>
            <div>Invoice for Table {selectedTable}:</div>
            <div style={{ marginBottom: '10px' }}></div>
            {invoiceDetails}
            <div style={{ marginTop: '10px' }}>Total Amount: ₹{totalAmount}</div>
          </div>
        );
  
        setModalTitle("Invoice");
        setModalMessage(formattedInvoice);
        setModalOpen(true);
      } else {
        setModalTitle("Error");
        setModalMessage(`No orders found for Table ${selectedTable}.`);
        setModalOpen(true);
      }
    } else {
      setModalTitle("Error");
      setModalMessage("No table selected.");
      setModalOpen(true);
    }
  };


  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle} 
        message={modalMessage} 
      />
    <div className='flex gap-5'>
    <div className="max-w-2xl m-5 p-6 bg-white rounded-lg shadow-md">
     
      <div className="flex justify-between items-center mb-4">
        {userName && <h2 className="text-xl font-bold">Welcome, {userName}!</h2>}
        <button onClick={() => handleCompleteOrder(selectedTable)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300">
          Complete Order
        </button>
        <button onClick={handleGenerateInvoice} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-300">
              Generate Invoice
            </button>
            <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300" onClick={handleLogout}>
              LogOut
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
                <div className="flex items-center">
                <button onClick={() => handleDecrement(item._id)} className="bg-gray-300 px-2 py-1 rounded-l">-</button>
                <input
                    type="number"
                    min="0"
                    className="border border-gray-300 p-2 rounded w-20 mx-2 text-center"
                    value={quantity[item._id] || 0}
                    readOnly
                  />
                  <button onClick={() => handleIncrement(item._id)} className="bg-gray-300 px-2 py-1 rounded-r">+</button>
                </div>
              
              </li>
            ))}
          </ul>
          <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-300"
                  onClick={handleOrder}
                >
                  Add to Order
                </button>
      <h3 className="text-xl font-bold mt-6">Your Current Order for Table {selectedTable}:</h3>
      <ul className="mt-4">
  {selectedTable !== null && orders[selectedTable]?.length === 0 ? (
    <p>No items added yet.</p>
  ) : (
    selectedTable !== null && orders[selectedTable]?.map((order, index: number) => (
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


      <h3 className="text-xl font-bold mt-6">Available Tables:</h3>
      <div className="flex flex-wrap justify-center mt-4" style={{ cursor: 'pointer' }}>
        {tables.filter(tableNumber => !reservedTables.includes(tableNumber)).map((tableNumber) => (
          <TableItem 
            number={tableNumber} 
            key={tableNumber}
            isSelected={selectedTable === tableNumber} 
            onClick={handleTableSelect} 
          />
        ))}
      </div>
    </div>
    <div>
      <h4 className="text-xl font-bold mt-6">Reserved Tables:</h4>
      {reservedTables.length > 0 ? (
        <ul>
          {reservedTables.map((tableNumber) => (
            <li key={tableNumber}>
                <TableItem 
            number={tableNumber} 
            key={tableNumber}
            isSelected={selectedTable === tableNumber} 
            onClick={handleTableSelect} 
          />
          </li>
          ))}
        </ul>
      ) : (
        <p>No tables reserved.</p>
      )}
    </div>
    </div>
    </>
);

};

export default Table;