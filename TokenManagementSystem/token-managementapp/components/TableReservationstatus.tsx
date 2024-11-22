import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Reservation {
    tableNumber: number;
    isReserved: boolean;
}

const TableReservationStatus = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const socket = useRef<Socket | null>(null);

    useEffect(() => {

    
        socket.current = io('http://localhost:2000');
       

        socket.current.on('table-reservation-updated', (data: Reservation) => {
            console.log('Received table-reservation-updated event:', data);
            console.log('Received tablesdsds-reservation-updated event:', data);
            console.log('Received tablesdsds-reservation-updated event:', data);

            setReservations(prev => {
                const index = prev.findIndex(res => res.tableNumber === data.tableNumber);
                if (index > -1) {
                    const updatedReservations = [...prev];
                    updatedReservations[index] = { ...updatedReservations[index], isReserved: data.isReserved };
                    return updatedReservations;
                }
                return [...prev, data]; // Add new reservation if it doesn't exist
            });
        });
        socket.current.on('user-logout', () => {
            console.log('User  logged out. Fetching updated reservations...');
            fetchReservations(); // Fetch the latest reservations
        });
    

        const fetchReservations = async () => {
            const response = await fetch('http://localhost:2000/api/tables/reservations');
            const data = await response.json();
            setReservations(data);
        };

        fetchReservations();
        return () => {
            socket.current?.disconnect();
        };
    }, []);

    const handleReserveTable = async (tableNumber: number, isReserved: boolean) => {
        const response = await fetch('http://localhost:2000/api/tables/reserve-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tableNumber, isReserved }),
        });
        
        if (!response.ok) {
            console.error('Failed to update reservation status');
            return;
        }
    
        const data: Reservation = await response.json();
    
        // Emit the reservation update event
        socket.current?.emit('table-reservation-updated', data);
    
        setReservations(prev => {
            const index = prev.findIndex(res => res.tableNumber === data.tableNumber);
            if (index > -1) {
                const updatedReservations = [...prev];
                updatedReservations[index] = data; // Update reservation status
                return updatedReservations;
            }
            return [...prev, data]; // Add new reservation if it doesn't exist
        });
    };
    const allTables = Array.from({ length: 10 }, (_, i) => i + 1);
    const reservedTableNumbers = reservations.filter(res => res.isReserved).map(res => res.tableNumber);
    const availableTables = allTables.filter(tableNumber => !reservedTableNumbers.includes(tableNumber));

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold text-center mb-6">Table Reservation Status</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="border px-4 py-2">Table Number</th>
                            <th className="border px-4 py-2">Reserved</th>
                            <th className="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                   {reservedTableNumbers.length>0?(
                    reservations.filter(reservation => reservation.isReserved).map(reservation => (
                        <tr key={reservation.tableNumber} className="border-b hover:bg-gray-100">
                            <td className="border px-4 py-2">{reservation.tableNumber}</td>
                            <td className="border px-4 py-2">{reservation.isReserved ? 'Yes' : 'No'}</td>
                            <td className="border px-4 py-2">
                                <button
                                    className={`bg-${reservation.isReserved ? 'red' : 'green'}-500 text-white px-4 py-2 rounded transition duration-300 hover:opacity-80`}
                                    onClick={() => handleReserveTable(reservation.tableNumber, !reservation.isReserved)}
                                >
                                    {reservation.isReserved ? 'Cancel Reservation' : 'Reserve Table'}
                                </button>
                            </td>
                        </tr >
                    ))
                   ):(
                    <div className="col-span-full text-2xl my-3 mx-3 text-left text-red-500">
                    No reserved TableNumbers here.
                    </div>
                   )}     
                    
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold mt-8 text-center">Available Tables</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {availableTables.length > 0 ? (
                    availableTables.map(tableNumber => (
                        <div key={tableNumber} className="bg-white shadow-lg rounded-lg p-4 text-center">
                            <h3 className="text-xl font-semibold">Table {tableNumber}</h3>
                            <p className="text-green-600">Available</p>
                            <button
                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded transition duration-300 hover:opacity-80"
                                onClick={() => handleReserveTable(tableNumber, true)}
                            >
                                Reserve Now
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-2xl text-center text-red-500">No tables available.</p>
                )}
            </div>
        </div>
    );

};

export default TableReservationStatus;