import React from "react";
import { OrderData } from "./OrderUtils"; // Ensure this path is correct

export const handleGenerateInvoice = (
  selectedTable: number | null,
  orders: { [key: number]: OrderData[] },
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setModalTitle: React.Dispatch<React.SetStateAction<string>>,
  setModalMessage: React.Dispatch<React.SetStateAction<React.ReactNode>>
) => {
  if (selectedTable !== null) {
    const order = orders[selectedTable];
    if (order && order.length > 0) {
      // Calculate total amount
      const totalAmount = order.reduce(
        (total, o) => total + o.price * o.quantity,
        0
      );

      // Create invoice details as a React component
      const invoiceDetails = order.map((o) => (
        <div key={o.itemId}>
          {o.itemName} - ₹{o.price} x {o.quantity} {o.quantityUnit}
        </div>
      ));

      // Create formatted invoice as a React node
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

      // Set modal state with the formatted invoice
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
