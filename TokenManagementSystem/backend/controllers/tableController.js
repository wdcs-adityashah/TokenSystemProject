import TableReservation from "../models/TableReservation.js";
import {io} from '../index.js';

export const UpdateTableReservation = async (req, res) => {
    const { tableNumber, isReserved, userId, isProcessed } = req.body;

    try {
        const reservation = await TableReservation.findOneAndUpdate(
            { tableNumber },
            { isReserved, userId, isProcessed },
            { new: true, upsert: true } // This will create a new document if one doesn't exist
        );

        // Check if reservation is null
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found or created." });
        }

        // Emit updated reservation status
        io.emit('table-reservation-updated', {
            tableNumber: reservation.tableNumber,
            isReserved: reservation.isReserved,
            isProcessed: reservation.isProcessed,
            userId: reservation.userId
        });

        return res.status(200).json(reservation);
    } catch (error) {
        console.error("Error updating table reservation:", error);
        return res.status(500).json({ message: "Failed to update table reservation." });
    }
};



export const getTableReservations = async(req,res)=>{
    try {
        const reservations = await TableReservation.find({});
        return res.json(reservations);
    } catch (error) {
        console.error("Error fetching table reservations:", error);
        return res.status(500).json({ message: error.message });

    }
}