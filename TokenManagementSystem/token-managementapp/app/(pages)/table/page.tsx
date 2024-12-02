"use client";
import React, { useEffect, useState, useRef } from "react";
import { fetchMenuItems } from "@/api/services/utils/api";
import {
  loadUserOrders,
  deleteOrder,
  OrderData,
} from "@/api/services/utils/OrderUtils";
import { io, Socket } from "socket.io-client";
import Modal from "@/components/Modal/Modal";
import { useRouter } from "next/navigation";
import { useOrderContext } from "@/app/context/OrderContext";
import TableList from "@/components/Table/TableList";
import OrderSummary from "@/components/Order/OrderSummary";
import MenuItem from "@/components/Menu/MenuItem";
import TableItem from "./TableItem";
import { handleCancelOrder } from "@/api/services/utils/cancelorderhandler";
import { handleOrder } from "@/api/services/utils/orderHandler";
import { handleLogout } from "@/api/services/utils/logoutorderhandler";
import { handleCompleteOrder } from "@/api/services/utils/completeorderhandler";
import { handleTableSelect } from "@/api/services/utils/handletableselect";
interface MenuItem {
  _id: string;
  itemName: string;
  price: number;
  quantity: string;
}
interface Reservation {
  tableNumber: number;
  isReserved: boolean;
  userId: string;
}

const Table = () => {
  const router = useRouter();
  const { addOrder } = useOrderContext();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
  const [orders, setOrders] = useState<{ [key: number]: OrderData[] }>({});
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [tables, setTables] = useState<number[]>(
    Array.from({ length: 10 }, (_, i) => i + 1)
  );
  const [reservedTables, setReservedTables] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]); // Store blocked users' emails or IDs

  const userReservation = reservations?.filter(
    (data: any) => data.userId == userName
  );
  console.log(userReservation, "userReservation");
  useEffect(() => {
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    const checkBlockedStatus = () => {
      const blockedUsers = JSON.parse(
        localStorage.getItem("blockedUsers") || "[]"
      );
      const loadedUser = localStorage.getItem("user");

      if (loadedUser) {
        const parsedUser = JSON.parse(loadedUser);
        setUserName(parsedUser.name);
        console.log(parsedUser);
        // Check if the current user is blocked
        if (blockedUsers.includes(parsedUser.id)) {
          // Assuming you store user ID
          localStorage.removeItem("token");
          alert("You have been blocked. Redirecting to login.");
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };

    // Check blocked status on initial mount
    checkBlockedStatus();

    // Listen for storage changes
    window.addEventListener("storage", checkBlockedStatus);

    return () => {
      window.removeEventListener("storage", checkBlockedStatus);
    };
  }, [router]);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const response = await fetch("http://localhost:2000/api/blocked-users");
        const data = await response.json();
        setBlockedUsers(data.map((user) => user.name)); // Assuming you want to store emails
      } catch (error) {
        console.error("Error fetching blocked users:", error);
      }
    };

    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    socketRef.current = io("http://localhost:2000");

    socketRef.current.on("table-reservation-updated", (data: Reservation) => {
      setReservedTables((prev) => {
        const index = prev.indexOf(data.tableNumber);
        if (data.isReserved && index === -1) {
          const updatedTables = [...prev, data.tableNumber];
          localStorage.setItem("reservedTables", JSON.stringify(updatedTables));
          return updatedTables; // Update state with the new list of reserved tables
        } else if (!data.isReserved && index > -1) {
          const updatedTables = prev.filter(
            (table) => table !== data.tableNumber
          );
          localStorage.setItem("reservedTables", JSON.stringify(updatedTables)); // Update localStorage
          return updatedTables; // Update state with the new list of reserved tables
        }
        return prev; // No change
      });
    });
    const fetchReservations = async () => {
      const response = await fetch(
        "http://localhost:2000/api/tables/reservations"
      );
      const data = await response.json();
      setReservations(data || []); // Ensure data is an array
      setReservedTables(
        data
          .filter((reservation: Reservation) => reservation.isReserved)
          .map((reservation: Reservation) => reservation.tableNumber)
      );
    };

    fetchReservations();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [modalMessage]);

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

    const loadedUser = localStorage.getItem("user");
    if (loadedUser) {
      const parsedUser = JSON.parse(loadedUser);
      setUserName(parsedUser?.name);
      socketRef.current?.emit("register", parsedUser.name);

      const userOrders = loadUserOrders(parsedUser?.name);
      const ordersByTable: { [key: number]: OrderData[] } = {};
      userOrders.forEach((order) => {
        if (
          order.tableNumber !== undefined &&
          typeof order.tableNumber === "number"
        ) {
          if (!ordersByTable[order.tableNumber]) {
            ordersByTable[order.tableNumber] = [];
          }
          ordersByTable[order.tableNumber].push(order);
        } else {
          console.warn(`Order with undefined or invalid tableNumber:`, order);
        }
      });

      setOrders(ordersByTable);
    } else {
      setOrders({});
      router.push("/login");
    }
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  const handleIncrement = (itemId: string) => {
    setQuantity((prev) => {
      const newState = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      return newState;
    });
  };

  const handleDecrement = (itemId: string) => {
    setQuantity((prev) => {
      const newState = { ...prev, [itemId]: (prev[itemId] || 0) - 1 };
      return newState;
    });
  };
  const isBlocked = userName ? blockedUsers.includes(userName) : false; // Check if the user is blocked
  // Debugging Logs
  const handleOrderClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    await handleOrder(
      event,
      userName,
      selectedTable,
      quantity,
      orders,
      menuItems,
      socketRef,
      setOrders
    );
  };

  const handleCancelOrderClick = async (index: number) => {
    if (selectedTable !== null) {
      await handleCancelOrder(
        index,
        selectedTable,
        userName,
        orders,
        setOrders,
        socketRef,
        setModalOpen,
        setModalTitle,
        setModalMessage
      );
    }
  };

  const handleCompleteOrderClick = async () => {
    await handleCompleteOrder(
      selectedTable,
      socketRef,
      setModalOpen,
      setModalTitle,
      setModalMessage,
      orders
    );
  };

  const handleLogoutClick = async () => {
    await handleLogout(
      userName,
      reservations,
      socketRef,
      router,
      setModalOpen,
      setModalTitle,
      setModalMessage,
      setOrders,
      setReservedTables
    );
  };

  const handleTableSelectClick = (tableNumber: number) => {
    handleTableSelect(tableNumber, orders, setOrders, setQuantity);
    setSelectedTable(tableNumber);
  };


  const handleGenerateInvoice = () => {
    if (selectedTable !== null) {
      const order = orders[selectedTable];
      if (order && order.length > 0) {
        // Calculate total amount
        const totalAmount = order.reduce(
          (total, o) => total + o.price * o.quantity,
          0
        );

        // Create formatted invoice details
        const invoiceDetails = order.map((o) => (
          <div key={o.itemId}>
            {o.itemName} - ₹{o.price} x {o.quantity} {o.quantityUnit}
          </div>
        ));

        // Add spacing and total amount
        const formattedInvoice = (
          <div>
            <div>Invoice for Table {selectedTable}:</div>
            <div style={{ marginBottom: "10px" }}></div>
            {invoiceDetails}
            <div style={{ marginTop: "10px" }}>
              Total Amount: ₹{totalAmount}
            </div>
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
      <div className="flex gap-5">
        <div className="max-w-2xl m-5 p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            {userName && (
              <h2 className="text-xl font-bold">Welcome, {userName}!</h2>
            )}
            <button
              onClick={handleCompleteOrderClick}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
              disabled={isBlocked} // Disable if blocked
            >
              Complete Order
            </button>
            <button
              onClick={handleGenerateInvoice}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-300"
            >
              Generate Invoice
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
              onClick={() => handleLogoutClick()}
            >
              LogOut
            </button>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">
            Place Your Order
          </h2>

          <h3 className="text-xl font-bold mt-6">Available Tables:</h3>
          <TableList
            tables={Array.from({ length: 10 }, (_, i) => i + 1).filter(
              (tableNumber) => !reservedTables.includes(tableNumber)
            )}
            reservedTables={reservedTables} // Add this line
            selectedTable={selectedTable}
            onTableSelect={handleTableSelectClick}
            reservations={reservations}
            userName={userName}
            isBlocked={isBlocked}
            disabled={isBlocked} // Pass the disabled prop
          />

          <ul className="space-y-4">
            {menuItems.map((item) => (
              <MenuItem
                key={item._id}
                item={item}
                quantity={quantity[item._id] || 0}
                onIncrement={() => handleIncrement(item._id)}
                onDecrement={() => handleDecrement(item._id)}
              />
            ))}
          </ul>
          <button
            className="bg-yellow-500 text-white px-3 mt-4 py-1 rounded hover:bg-yellow-600 transition duration-300"
            onClick={handleOrderClick}
            disabled={isBlocked} // Disable if blocked
          >
            Add to Order
          </button>
          <OrderSummary
            orders={selectedTable !== null ? orders[selectedTable] || [] : []} // Ensure it defaults to an empty array
            onCancelOrder={(index) => handleCancelOrderClick(index)}
            selectedTable={selectedTable}
          />
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
                    onClick={() =>
                      userReservation.find(
                        (data: any) => data.tableNumber == tableNumber
                      )
                        ? handleTableSelect(tableNumber)
                        : undefined
                    }
                    disabled={
                      userReservation.find(
                        (data: any) => data.tableNumber == tableNumber
                      )
                        ? false
                        : true
                    }
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
