// src/api/services/utils/handleCompleteOrder.ts

import { Socket } from "socket.io-client";
import { OrderData } from "./OrderUtils"; // Adjust the import path as necessary

interface Reservation {
  tableNumber: number;
  isReserved: boolean;
  userId: string;
}

export const handleCompleteOrder = async (
  tableNumber: number | null,
  socketRef: React.RefObject<Socket>,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setModalTitle: React.Dispatch<React.SetStateAction<string>>,
  setModalMessage: React.Dispatch<React.SetStateAction<string>>,
  orders: { [key: number]: OrderData[] }
) => {
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
    const response = await fetch(
      "http://localhost:2000/api/tables/reserve-table",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableNumber, isReserved: true }),
      }
    );

    if (!response.ok) {
      console.error("Failed to update reservation status");
      return;
    }
    const data: Reservation = await response.json();
    socketRef.current?.emit("table-reservation-updated", data);
  } catch (error) {
    console.error("Failed to complete order:", error);
    setModalTitle("Error");
    setModalMessage("Failed to complete order. Please try again.");
    setModalOpen(true);
  }
};