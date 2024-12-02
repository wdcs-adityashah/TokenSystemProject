import { OrderData } from "./OrderUtils";
import { setLocalStorageItem } from "./localstorage";

// Define the type for MenuItem
interface MenuItem {
  _id: string;
  itemName: string;
  price: number;
  quantity: string;
}

// Define the type for the socket reference
type SocketRef = {
  current: {
    emit: (event: string, data: any) => void;
  } | null;
};
interface Reservation {
    tableNumber: number;
    isReserved: boolean;
    userId: string;
  }
export const handleOrder = async (
  event: React.MouseEvent<HTMLButtonElement>,
  userName: string | null,
  selectedTable: number | null,
  quantity: { [key: string]: number },
  orders: { [key: number]: OrderData[] },
  menuItems: MenuItem[],
  socketRef: SocketRef,
  setOrders: React.Dispatch<React.SetStateAction<{ [key: number]: OrderData[] }>> // Pass setOrders as an argument
) => {
  event.preventDefault();

  if (!userName || selectedTable === null || Object.keys(quantity).length === 0) return;

  const existingOrders = orders[selectedTable] || [];
  const existingOrdersMap: { [key: string]: OrderData } = existingOrders.reduce((acc, order) => {
    acc[order.itemId] = order;
    return acc;
  }, {} as { [key: string]: OrderData });

  let hasOrders = false;

  menuItems.forEach((item) => {
    const qty = quantity[item._id] || 0;
    if (qty > 0) {
      hasOrders = true;
      if (existingOrdersMap[item._id]) {
        existingOrdersMap[item._id].quantity = qty;
      } else {
        existingOrdersMap[item._id] = {
          itemId: item._id,
          itemName: item.itemName,
          price: item.price,
          quantity: qty,
          quantityUnit: item.quantity,
          tableNumber: selectedTable,
        };
      }
    }
  });

  if (!hasOrders) return;

  const updatedOrders = Object.values(existingOrdersMap);
  setOrders((prevOrders) => {
    const newOrders = { ...prevOrders, [selectedTable]: updatedOrders };
    setLocalStorageItem("orders", newOrders);
    return newOrders;
  });

  const newOrder = {
    userId: userName,
    tableNumber: selectedTable,
    items: updatedOrders.map((o) => ({
      itemName: o.itemName,
      price: o.price,
      quantity: o.quantity,
    })),
    totalAmount: updatedOrders.reduce((total, o) => total + o.price * o.quantity, 0),
  };

  try {
    const response = await fetch("http://localhost:2000/api/tableorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });

    if (!response.ok) throw new Error("Failed to add order");
    const data = await response.json();
    socketRef.current?.emit("new-order", data);

    // Update table reservation status
    try {
      const response = await fetch(
        "http://localhost:2000/api/tables/reserve-table",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableNumber: selectedTable,
            isProcessed: true,
            userId: userName,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update reservation status");
        return;
      }

      const data: Reservation = await response.json();
      socketRef.current?.emit("table-reservation-updated", data);
    } catch (error) {
      console.error("Failed to complete order :", error);
    }
  } catch (error) {
    console.error("Error adding order:", error);
  }
};