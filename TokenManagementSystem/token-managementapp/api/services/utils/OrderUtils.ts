export interface OrderData {
  itemId: string;       
  itemName: string;      
  price: number;
  quantity: number;     
  timestamp?: string;   
  quantityUnit: string;  
  tableNumber?: number; 
  userId?: string; // Add this line if userId should be part of OrderData

}
export const saveOrder = (username: string, order: OrderData) => {
  const key = `orders_${username}`;
  const currentOrders = JSON.parse(localStorage.getItem(key) || '[]');

  const orderWithTimestamp = { ...order, timestamp: new Date().toISOString().split('T')[0] };
  currentOrders.push(orderWithTimestamp);
  localStorage.setItem(key, JSON.stringify(currentOrders));
};

export const loadUserOrders = (username: string): OrderData[] => {
  return JSON.parse(localStorage.getItem(`orders_${username}`) || '[]');
};

export const deleteOrder = (username: string, index: number) => {
  const key = `orders_${username}`;
  const currentOrders = loadUserOrders(username);
  
  if (index >= 0 && index < currentOrders.length) {
    currentOrders.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(currentOrders));
  }
};
