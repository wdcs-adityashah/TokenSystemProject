import mongoose from "mongoose";
const menuItemSchema = new mongoose.Schema({
    itemName:{type:String,required:true},
    price:{type:Number,required:true},
    quantity:{type:String,required:true}
}) 
const MenuItem = mongoose.model('MenuItem',menuItemSchema);
export default MenuItem;    