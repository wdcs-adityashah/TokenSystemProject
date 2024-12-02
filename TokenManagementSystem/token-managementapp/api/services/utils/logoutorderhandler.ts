import { OrderData } from "./OrderUtils";

interface Reservation {
    tableNumber: number;
    isReserved: boolean;
    userId: string;
  }
  
export const handleLogout = async (
  userName: string | null,
  reservations: Reservation[],
  socketRef: React.RefObject<any>,
  router: any,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setModalTitle: React.Dispatch<React.SetStateAction<string>>,
  setModalMessage: React.Dispatch <React.SetStateAction<string>>,
  setOrders: React.Dispatch<React.SetStateAction<{ [key: number]: OrderData[] }>>,
  setReservedTables: React.Dispatch<React.SetStateAction<number[]>>,
) => {
  try {
    socketRef.current?.emit("user-logout", { userName });
    const tablesToUnreserve = reservations
      .filter((reservation) => reservation.userId === userName && reservation.isReserved)
      .map((reservation) => reservation.tableNumber);

    const unreservePromises = tablesToUnreserve.map(async (tableNumber) => {
      const response = await fetch(
        "http://localhost:2000/api/tables/reserve-table",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableNumber,
            isReserved: false,
            isProcessed: false,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to update reservation status for table ${tableNumber}:`, errorText);
        throw new Error(`Failed to update reservation status for table ${tableNumber}`);
      }

      const data: Reservation = await response.json();
      socketRef.current?.emit("table-reservation-updated", data);
    });

    await Promise.all(unreservePromises);

    localStorage.removeItem("orders");
    localStorage.removeItem("reservedTables");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setOrders({});
    setReservedTables([]);
    router.push("/userdetails");
  } catch (error) {
    console.error("Failed to complete logout:", error);
    setModalTitle("Error");
    setModalMessage("Failed to log out. Please try again.");
    setModalOpen(true);
  }
};