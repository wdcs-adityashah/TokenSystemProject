// models/TokenModel.js
import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    tokenNumber: { type: Number, required: true, unique: true }, // Ensure this is unique
    menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    status: { 
        type: String, 
        enum: ['active', 'pending', 'completed', 'cancelled'], // Include 'active'
        default: 'pending' 
    },
    date: { type: String, required: true }, // Add this line to store the token creation date

}, { timestamps: true });

const TokenModel = mongoose.model('Token', tokenSchema);
export default TokenModel;
