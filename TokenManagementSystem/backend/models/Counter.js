// models/Counter.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequenceValue: { type: Number, default: 0 },
    date: { type: String }, // Add the date field

});

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
