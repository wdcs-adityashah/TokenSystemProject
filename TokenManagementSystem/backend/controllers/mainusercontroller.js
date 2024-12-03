import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key'; 

export const ValidateCredentials = async (req, res) => {
    const { password, email } = req.body;

    if (password === "aadi2781" && email === "admin@gmail.com") {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: '7d' }); 
        return res.status(200).json({ message: "Login successful", token, refreshToken });
    } else {
        return res.status(400).json({ message: "Invalid Credentials" });
    }
};