// utils/OrderUtils.ts

// Define the OrderData interface to structure order data
export interface OrderData {
  itemId: string;        // Unique identifier for the item
  itemName: string;      // Name of the item
  price: number;         // Price of the item
  quantity: number;      // Quantity of the item ordered
  timestamp?: string;    // Optional, to store the order date
  quantityUnit: string;  // Unit of measurement for the quantity (e.g., kg, pcs)
  tableNumber?: number; // Optional property

}

// Function to save a new order for a specific user in localStorage
export const saveOrder = (username: string, order: OrderData) => {
  const key = `orders_${username}`;
  const currentOrders = JSON.parse(localStorage.getItem(key) || '[]');

  // Add the current date as a timestamp in 'YYYY-MM-DD' format
  const orderWithTimestamp = { ...order, timestamp: new Date().toISOString().split('T')[0] };
  currentOrders.push(orderWithTimestamp);
  localStorage.setItem(key, JSON.stringify(currentOrders));
};

// Function to load orders for a specific user
export const loadUserOrders = (username: string): OrderData[] => {
  return JSON.parse(localStorage.getItem(`orders_${username}`) || '[]');
};

// Function to delete an order from a specific user’s orders
export const deleteOrder = (username: string, index: number) => {
  const key = `orders_${username}`;
  const currentOrders = loadUserOrders(username);
  
  // Check if the index is valid before trying to remove an order
  if (index >= 0 && index < currentOrders.length) {
    currentOrders.splice(index, 1); // Remove order at the specified index
    localStorage.setItem(key, JSON.stringify(currentOrders));
  }
};
