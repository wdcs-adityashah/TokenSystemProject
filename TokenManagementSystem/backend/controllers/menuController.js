import MenuItem from "../models/MenuItem.js";

export const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        
        // If no menu items are found, return the default menu items
        if (menuItems.length === 0) {
            return res.json(defaultMenuItems); // Return default items only
        }

        // Return the found menu items
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Default menu items
// Default menu items
export const defaultMenuItems = [
    { itemName: 'Fafda', price: 20, quantity: 'pieces' },
    { itemName: 'Gathiya', price: 30, quantity: 'grams' },
    { itemName: 'Chatni', price: 10, quantity: 'grams' },
    { itemName: 'Jalebi', price: 40, quantity: 'pieces' },
    { itemName: 'Gulabjamun', price: 50, quantity: 'pieces' },
];

// Create, update, and delete functions remain unchanged
export const createMenuItem = async (req, res) => {
    const { itemName, price, quantity } = req.body; // Ensure you extract quantity

    // Validate incoming data
    if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
        return res.status(400).json({ message: "Invalid item name." });
    }

    if (price === undefined || typeof price !== 'number' || price < 0) {
        return res.status(400).json({ message: "Invalid price." });
    }

    if (!quantity || typeof quantity !== 'string' || quantity.trim() === '') { // Check quantity
        return res.status(400).json({ message: "Invalid quantity." });
    }

    // Attempt to save the valid items to the database
    try {
        const newItem = new MenuItem({ itemName, price, quantity }); // Save as quantity
        await newItem.save();
        res.status(201).json(newItem);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const updateMenuItem = async (req, res) => {
    const { id } = req.params; // Destructure id from req.params
    const updatedData = req.body;

    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error); // More descriptive log
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    const { id } = req.params; // Get id from params
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};