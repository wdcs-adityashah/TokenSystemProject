import MenuItem from "../models/MenuItem.js";

export const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        
        if (menuItems.length === 0) {
            return res.json(defaultMenuItems);
        }

        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const defaultMenuItems = [
    { itemName: 'Fafda', price: 20, quantity: 'pieces' },
    { itemName: 'Gathiya', price: 30, quantity: 'grams' },
    { itemName: 'Chatni', price: 10, quantity: 'grams' },
    { itemName: 'Jalebi', price: 40, quantity: 'pieces' },
    { itemName: 'Gulabjamun', price: 50, quantity: 'pieces' },
];

export const createMenuItem = async (req, res) => {
    const { itemName, price, quantity } = req.body; 

    if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
        return res.status(400).json({ message: "Invalid item name." });
    }

    if (price === undefined || typeof price !== 'number' || price < 0) {
        return res.status(400).json({ message: "Invalid price." });
    }

    if (!quantity || typeof quantity !== 'string' || quantity.trim() === '') {
        return res.status(400).json({ message: "Invalid quantity." });
    }

    try {
        const newItem = new MenuItem({ itemName, price, quantity });
        await newItem.save();
        res.status(201).json(newItem);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const updateMenuItem = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error); 
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};