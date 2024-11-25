import mongoose from "mongoose";
import { type } from "os";
const tableReservationSchema = new mongoose.Schema({
    tableNumber:{type:Number,required:true,unique:true},
    isReserved:{type:Boolean,default:false},
    isProcessed:{type:Boolean,default:false},
    userId: {
        type: String, // Change from ObjectId to String
        required: true,
    },

});
const TableReservation = mongoose.model('TableReservation',tableReservationSchema);
export default TableReservation;