// app/components/Order/OrderSummary.tsx
import React from "react";
import { OrderData } from "@/api/services/utils/OrderUtils";

interface OrderSummaryProps {
  orders: OrderData[];
  onCancelOrder: (index: number, tableNumber: number | null) => void; // Update to expect two parameters
  selectedTable: number | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orders, onCancelOrder, selectedTable }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mt-6">Your Current Order for Table {selectedTable}:</h3>
      <ul className="mt-4">
        {selectedTable !== null && orders.length === 0 ? (
          <p>No items added yet.</p>
        ) : (
          selectedTable !== null &&
          orders.map((order, index) => (
            <li key={index} className="p-2 border-b border-gray-200 flex justify-between items-center">
              {order.itemName} - ₹{order.price} x {order.quantity} {order.quantityUnit}
              <button onClick={() => onCancelOrder(index, selectedTable)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300">Cancel</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default OrderSummary;