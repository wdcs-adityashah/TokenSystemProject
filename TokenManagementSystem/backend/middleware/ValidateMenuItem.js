// middleware/validateMenuItems.js
import { defaultMenuItems } from "../controllers/menuController.js"; // Adjust the import as necessary

const validateMenuItems = (req, res, next) => {
    const { itemName } = req.body;

    // Check if menuItemIds is provided and is an array
    if (itemName != defaultMenuItems) {
        return res.status(400).json({ message: "Itemname is not valid" });
    }

    next();
};

export default validateMenuItems;
