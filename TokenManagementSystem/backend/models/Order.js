import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    items: [{ itemName: String, price: Number, quantity: Number }],
    userToken: { type: String, required: true }, // Token generated on order
    status: { type: String, enum: ['Pending', 'Complete'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);