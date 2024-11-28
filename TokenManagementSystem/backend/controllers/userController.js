import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Ensure you import jwt if you're using it
import { isValidEmail } from "../validator/userValidator.js";
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key'; // Ensure you have a secret key

export const registerUser  = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if(!isValidEmail(email)){
        return res.status(400).json({message:"Invalid email format"});
    }
    try {
        const existingUser  = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User  already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
        const newUser  = new User({ name, email, password: hashedPassword }); // Save the hashed password
        const savedUser  = await newUser .save();
       // Return the user data in the expected format
       res.status(201).json({
        userId: savedUser._id, // Include userId in the response
        session: {
            user: {
                name: savedUser.name,
                email: savedUser.email
            }
        }
    });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const loginUser  = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No record found" });
        }
        const isMatch = await bcrypt.compare(password, user.password); // Use bcrypt to compare passwords
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({
            message: "success",
            userId: user._id, // Include userId in the response
            session: {
                user: {
                    name: user.name,
                    email: user.email
                }
            },
            token
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getUsers = async (req, res) => {
    try {
      const users = await User.find(); // Fetch all users from the database
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  export const blockUser  = async (req, res) => {
    const { id } = req.params; // Get user ID from the request parameters
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User  not found" });
        }
        user.blocked = true; // Set the blocked field to true
        await user.save(); // Save the updated user
        res.status(200).json({ message: "User  blocked successfully" });
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getBlockedUsers = async(req,res)=>{
    try {
        const blockedUsers = await User.find({ blocked: true }); // Fetch all blocked users
        res.json(blockedUsers); // Return the blocked users
    } catch (error) {
        console.error("Error fetching blocked users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}