import { OrderData } from "./OrderUtils";
export const handleTableSelect = (
  tableNumber: number,
  orders: { [key: number]: OrderData[] },
  setOrders: React.Dispatch<React.SetStateAction<{ [key: number]: OrderData[] }>>,
  setQuantity: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
) => {
  const existingOrders = orders[tableNumber] || [];
  setOrders((prevOrders) => ({
    ...prevOrders,
    [tableNumber]: existingOrders,
  }));
  setQuantity({});
};