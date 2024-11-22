import TableReservation from "../models/TableReservation.js";
import {io} from '../index.js';

export const UpdateTableReservation = async (req,res) =>{
    const {tableNumber,isReserved} = req.body;
    try {
        const reservation = await TableReservation.findOneAndUpdate(
            {tableNumber},
            {isReserved},
            {new:true,upsert:true}
        );
        io.emit('table-reservation-updated', {
            tableNumber: reservation.tableNumber,
            isReserved: reservation.isReserved
        });
                return res.status(200).json(reservation);
    } catch (error) {
        console.error("Error updating table reservation:",error);
        return res.status(500).json({message:"Failed to update table reservation."});
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