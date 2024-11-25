import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import menuRoutes from './routes/menuRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import mainuserRoutes from './routes/mainuserRoutes.js';
import userRoutes from './routes/userRoutes.js'
import http from 'http';
import { Server } from 'socket.io';
import tableRoutes from './routes/tableRoutes.js'
import TableReservation from './models/TableReservation.js';
dotenv.config();
connectDB();

const app = express();
const PORT = 2000;

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/menu', menuRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/mainuser', mainuserRoutes);
app.use('/api/tables',tableRoutes);
app.use('/api',userRoutes);
// Create HTTP server and Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', 
        credentials: true,
    }
});
// Store user socket IDs
const userSockets = {};



// Socket.io connection setup
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id); // Log connected client ID
    socket.on('register', (userId) => {
        userSockets[userId] = socket.id;
        console.log(`User  registered: ${userId}`);
    });

    // Listen for token emission from the frontend
    socket.on('emit-token', (token) => {
        console.log(`Received token from frontend: ${token}`);
        io.emit('receive-token', token);
    });
    socket.on('user-logout', (data) => {
        console.log(`User  logged out:`, data);
        // Emit an event to notify all clients about the logout
        io.emit('user-logout', data); // Notify all clients
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('table-reservation-updated', (data) => {
        console.log(`Received table-reservation-updated event:`, data);
        if (data && typeof data === 'object') {
            const { tableNumber, isReserved, userId } = data;
            if (userId) {
                io.to(userId).emit('table-reservation-updated', { tableNumber, isReserved,userId });
            } else {
                console.error(`User  ID ${userId} not found.`);
            }
            // io.emit('table-reservation-updated', { tableNumber, isReserved });
        } else {
            console.error("Received data is not an object:", data);
        }
        // if (data && typeof data === 'object') {
        //     const { tableNumber, isReserved } = data;
        //     console.log(`Table Number: ${tableNumber}, Is Reserved: ${isReserved}`);
            
        //     // Here you can update the database with the new reservation status
        //     // For example, you could call a function to update the reservation in the database
        //     // updateTableReservation(tableNumber, isReserved); // Implement this function as needed

        //     // Emit the updated reservation status to all clients
        //     // io.emit('table-reservation-updated', { tableNumber, isReserved });
        // } else {
        //     console.error("Received data is not an object:", data);
        // }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Function to broadcast token completion status to clients
export const broadcastTokenCompletion = (completedTokenNumber) => {
    const message = { status: 'completed', tokenNumber: completedTokenNumber };
    console.log(`Broadcasting token completion: ${completedTokenNumber}`); // Log the token number being broadcast
    io.emit('token-updated', message); // Emit to all connected clients
};


// Export the io instance for use in other modules
export { io };

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});