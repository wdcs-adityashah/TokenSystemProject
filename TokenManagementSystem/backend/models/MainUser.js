import mongoose from "mongoose";
const MainUserSchema = new mongoose.Schema({
    email:string,
    password:string,
})
const MainuserModel = mongoose.model("mainuser",MainUserSchema);
module.exports = MainuserModel