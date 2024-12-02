// app/components/Menu/Menu.tsx
import React from "react";

interface MenuItemProps {
  item: {
    _id: string;
    itemName: string;
    price: number;
  };
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, quantity, onIncrement, onDecrement }) => {
  return (
    <div className="flex justify-between items-center p-4 border border-gray-300 rounded-md shadow-md hover:shadow-lg transition duration-200 bg-white">
      <div className="flex flex-col">
        <span className="font-semibold text-lg">{item.itemName}</span>
        <span className="text-gray-600">₹{item.price} per unit</span>
      </div>
      <div className="flex items-center">
        <button
          onClick={onDecrement}
          className="bg-gray-300 px-2 py-1 rounded-l hover:bg-gray-400 transition duration-200"
        >
          -
        </button>
        <input
          type="number"
          min="0"
          className="border border-gray-300 p-2 rounded w-20 mx-2 text-center"
          value={quantity}
          readOnly
        />
        <button
          onClick={onIncrement}
          className="bg-gray-300 px-2 py-1 rounded-r hover:bg-gray-400 transition duration-200"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default MenuItem;