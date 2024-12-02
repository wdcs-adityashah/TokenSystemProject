import { OrderData } from "./OrderUtils";
import { setLocalStorageItem } from "./localstorage";
import { deleteOrder } from "./OrderUtils";
export const handleCancelOrder = async (
  index: number,
  tableNumber: number | null,
  userName: string | null,
  orders: { [key: number]: OrderData[] },
  setOrders: React.Dispatch<React.SetStateAction<{ [key: number]: OrderData[] }>>,
  socketRef: React.RefObject<any>,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setModalTitle: React.Dispatch<React.SetStateAction<string>>,
  setModalMessage: React.Dispatch<React.SetStateAction<string>>,
) => {
  if (userName && tableNumber !== null) {
    const currentOrders: OrderData[] = orders[tableNumber] || [];

    if (index >= 0 && index < currentOrders.length) {
      const orderToDelete = currentOrders[index];

      const updatedOrders = currentOrders.filter((_, i) => i !== index);

      setOrders((prevOrders) => {
        const updatedState = {
          ...prevOrders,
          [tableNumber]: updatedOrders,
        };
        setLocalStorageItem("orders", updatedState);
        return updatedState;
      });

      // Assume deleteOrder is a function that deletes the order from the database
      await deleteOrder(userName, Number(orderToDelete.itemId));

      if (updatedOrders.length === 0) {
        try {
          setModalTitle("Success");
          setModalMessage("Order cancelled successfully!");
          setModalOpen(true);
          const response = await fetch(
            "http://localhost:2000/api/tables/reserve-table",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                tableNumber,
                isProcessed: false,
              }),
            }
          );

          if (!response.ok) {
            console.error("Failed to update reservation status");
            return;
          }

          const data = await response.json();
          socketRef.current?.emit("table-reservation-updated", data);
        } catch (error) {
          console.error("Failed to cancel order:", error);
          setModalTitle("Error");
          setModalMessage("Invalid order index.");
          setModalOpen(true);
        }
      }
    }
  }
};