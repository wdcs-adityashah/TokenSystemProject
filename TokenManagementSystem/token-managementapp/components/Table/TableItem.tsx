// app/components/Table/TableItem.tsx
import React from "react";

interface TableItemProps {
  number: number;
  isSelected: boolean;
  onClick: (number: number) => void;
  isReserved: boolean;
  disabled: boolean;
  isBlocked: boolean; // Add this line
}

const TableItem: React.FC<TableItemProps> = ({
  number,
  isSelected,
  onClick,
  isReserved,
  disabled,
  isBlocked, // Add this line
}) => {
  const handleClick = () => {
    if (!isReserved && !isBlocked) {
      onClick(number);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center border rounded-md shadow p-4 m-2 transition duration-300 ${
        disabled || isBlocked ? "bg-gray-500 text-black" : ""
      } ${isSelected ? "bg-blue-500 text-white" : "bg-white text-black"}`}
      onClick={handleClick}
    >
      <h3 className="text-xl font-semibold">Table {number}</h3>
    </div>
  );
};

export default TableItem;