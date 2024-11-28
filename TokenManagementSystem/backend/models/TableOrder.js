import mongoose from "mongoose";

const TableOrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    tableNumber: { type: Number, required: true },
    items: [{
        itemName: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }

});
const TableOrder = mongoose.model('TabelOrder',TableOrderSchema);
export default TableOrder;