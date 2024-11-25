// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// const authenticateUser  = (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         req.userId = decoded.id; // Attach user ID to request
//         next(); // Proceed to the next middleware or route handler
//     });
// };
// export default authenticateUser ;