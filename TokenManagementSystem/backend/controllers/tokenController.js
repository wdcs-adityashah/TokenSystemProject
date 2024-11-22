// controllers/tokenController.js
import Token from "../models/Token.js";
import MenuItem from "../models/MenuItem.js";
import Counter from "../models/Counter.js";
import mongoose from "mongoose";
import moment from "moment";
import { broadcastTokenCompletion } from "../index.js";
import { io } from "../index.js";
const getNextTokenNumber = async () => {
    const today = moment().format("YYYY-MM-DD");
    const counter = await Counter.findOneAndUpdate(
        { _id: "tokenNumber" },
        { $inc: { sequenceValue: 1 }, date: today },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Reset sequence if counter date is not today
    if (counter.date !== today) {
        counter.sequenceValue = 1;
        counter.date = today;
        await counter.save();
    }

    return counter.sequenceValue;
};

export default getNextTokenNumber;

export const createToken = async (req, res) => {
    const { menuItemIds } = req.body;

    // Validate input
    if (!menuItemIds || !Array.isArray(menuItemIds)) {
        return res.status(400).json({ message: "Invalid or missing menuItemIds." });
    }

    try {
        const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
        if (menuItems.length !== menuItemIds.length) {
            return res.status(404).json({ message: "Some menu items not found." });
        }

        // Get the next unique token number
        const tokenNumber = await getNextTokenNumber();
        const today = moment().format("YYYY-MM-DD");

        // Create new token with today's date
        const newToken = new Token({
            tokenNumber,
            menuItems: menuItemIds,
            status: 'pending',
            date: today,
        });

        const savedToken = await newToken.save();
        console.log("Token saved to database:", savedToken); // Log the saved token

        // Emit the new token event
        io.emit('new-token', savedToken); // Emit the new token to all connected clients

        return res.status(201).json(savedToken);

    } catch (error) {
        console.error("Error creating token:", error);
        return res.status(500).json({ message: "Failed to create token." });
    }
};


export const getActiveTokens = async (req, res) => {
    try {
        // Find all tokens created today, regardless of their status
        const tokens = await Token.find({
            date: moment().format("YYYY-MM-DD")
        }).populate('menuItems');

        return res.json(tokens);
    } catch (error) {
        console.error("Error fetching tokens:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const updateTokenStatus = async (req, res) => {
    const { tokenId, status } = req.body;

    try {
        const updatedToken = await Token.findByIdAndUpdate(
            tokenId, // Use the tokenId directly if it's an ObjectId
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedToken) {
            return res.status(404).json({ message: 'Token not found' });
        }

        // Log the updated token number
        console.log(`Token updated: ${updatedToken.tokenNumber}, New Status: ${updatedToken.status}`);

        // Broadcast the token completion status
        broadcastTokenCompletion(updatedToken.tokenNumber); // Call the function with the token number

        res.status(200).json(updatedToken);
    } catch (error) {
        console.error('Error updating token status:', error);
        res.status(500).json({ message: 'Error updating token status' });
    }
};



