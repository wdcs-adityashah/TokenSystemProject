'use client';

import React, { useEffect, useState } from 'react';
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '@/utils/api';

interface MenuItem {
  _id: string;
  itemName: string;
  price: number;
  quantity: string; // New property to store the unit of measurement
}

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<number | ''>('');
  const [itemUnit, setItemUnit] = useState(''); // State for unit input
  const [editMode, setEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const items = await fetchMenuItems();
        console.log("Fetched Menu Items:", items); // Log fetched items
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const priceToSend = Number(itemPrice);
    const menuItemData: MenuItem = {
      _id: currentItemId!,
      itemName,
      price: priceToSend,
      quantity: itemUnit,
    };
  
    console.log("Menu Item Data:", menuItemData); // Log item data being sent
    console.log("Menu Item234 Data:", menuItemData); // Log item data being sent

    try {
      if (editMode) {
        await updateMenuItem(currentItemId!, menuItemData);
        console.log("Updated Menu Item:", menuItemData);
      } else {
        await createMenuItem(menuItemData);
        console.log("Created Menu Item:", menuItemData);
      }
  
      // Reset form fields and states
      setItemName('');
      setItemPrice('');
      setItemUnit('');
      setEditMode(false);
      setCurrentItemId(null);
  
      // Reload menu items after addition or update
      const items = await fetchMenuItems();
      console.log("Fetched Menu Items after save:", items); // Log fetched items
      setMenuItems(items);
    } catch (error) {
      console.error("Error saving item:", error);
      alert("There was an error processing your request. Please try again.");
    }
  };

  const handleEdit = (item: MenuItem) => {
    console.log("Editing Item:", item); // Log the item being edited
    setItemName(item.itemName);
    setItemPrice(item.price);
    setItemUnit(item.quantity); // Set the unit for editing
    setEditMode(true);
    setCurrentItemId(item._id);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete the item?');
    if (isConfirmed) {
      try {
        await deleteMenuItem(id);
        console.log("Deleted Menu Item with ID:", id);
        // Reload menu items after deletion
        const items = await fetchMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert("There was an error deleting the item. Please try again.");
      }
    }
  };

  if (loading) return <div>Loading menu items...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Menu Management</h2>

      <form onSubmit={handleAddOrUpdate} className="mb-6">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <input
            type="number"
            placeholder="Price (₹)"
            value={itemPrice}
            onChange={(e) => {
              console.log("Item Price Input:", e.target.value); // Log the input value
              setItemPrice(Number(e.target.value));
            }}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Unit (e.g., grams, pieces)"
            value={itemUnit}
            onChange={(e) => setItemUnit(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
            {editMode ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>

      <h3 className="text-xl font-bold mt-4">Menu Items</h3>
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item._id} className="p-4 border border-gray-200 rounded-md shadow hover:shadow-lg transition duration-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">{item.itemName}</span> - ₹{item.price} per <span className="font-semibold">{item.quantity}</span>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Menu;
