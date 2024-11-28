import TableOrder from "../models/TableOrder.js";

export const getAllOrders = async(req,res) =>{
    try {
        const orders = await TableOrder.find({});
        return res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}
export const addOrder = async (req, res) => {
    try {
        const newOrder = new TableOrder(req.body);
        await newOrder.save();
        return res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};