// app/(pages)/table/TableItem.tsx
"use client";
import React from "react";

interface Reservation {
    tableNumber: number;
    isReserved: boolean;
    userId: string;
  }
  

interface TableItemProps {
  number: number;
  isSelected: boolean;
  onClick: (number: number) => void;
  reservations: Reservation[];
  userName: string | null;
  disabled: boolean;
}

const TableItem: React.FC<TableItemProps> = ({
  number,
  isSelected,
  onClick,
  reservations = [],
  userName = null,
  disabled,
}) => {
  const isReserved = reservations.some(
    (res) => res.tableNumber === number && res.isReserved
  );
  const reservedBy =
    reservations.find((res) => res.tableNumber === number)?.userId || null;

  return (
    <div
      className={`flex flex-col items-center justify-center border rounded-md shadow p-4 m-2 transition duration-300 ${
        disabled ? "bg-gray-500 text-black" : ""
      } ${isSelected ? "bg-blue-500 text-white" : "bg-white text-black"}`}
      onClick={() =>
        isReserved && reservedBy !== userName ? undefined : onClick(number)
      }
    >
      <h3 className="text-xl font-semibold">Table {number}</h3>
    </div>
  );
};

export default TableItem;