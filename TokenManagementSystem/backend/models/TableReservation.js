import mongoose from "mongoose";
const tableReservationSchema = new mongoose.Schema({
    tableNumber:{type:Number,required:true,unique:true},
    isReserved:{type:Boolean,default:false},
});
const TableReservation = mongoose.model('TableReservation',tableReservationSchema);
export default TableReservation;