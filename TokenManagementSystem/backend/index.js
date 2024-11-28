// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import menuRoutes from './routes/menuRoutes.js';
// import tokenRoutes from './routes/tokenRoutes.js';
// import mainuserRoutes from './routes/mainuserRoutes.js';
// import userRoutes from './routes/userRoutes.js'
// import http from 'http';
// import { Server } from 'socket.io';
// import tableRoutes from './routes/tableRoutes.js'
// import TableReservation from './models/TableReservation.js';
// dotenv.config();
// connectDB();

// const app = express();
// const PORT = 2000;

// // CORS configuration
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true,
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // API routes
// app.use('/api/menu', menuRoutes);
// app.use('/api/tokens', tokenRoutes);
// app.use('/api/mainuser', mainuserRoutes);
// app.use('/api/tables',tableRoutes);
// app.use('/api',userRoutes);
// // Create HTTP server and Socket.io server
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: 'http://localhost:3000', 
//         credentials: true,
//     }
// });
// // Function to clear reservations
// const clearReservations = async () => {
//     try {
//         await TableReservation.deleteMany({});
//         console.log('Cleared all reservations for new users');
//     } catch (err) {
//         console.error('Error clearing reservations:', err);
//     }
// };

// // Store user socket IDs
// const userSockets = {};



// // Socket.io connection setup
// io.on('connection', (socket) => {
//     console.log('Client connected:', socket.id); // Log connected client ID
//     socket.on('leave-room', (userId) => {
//         socket.leave(userId); // Leave the room based on userId
//         console.log(`User  ${userId} left room: ${socket.id}`);
//     });

//     socket.on('register', (userId) => {
//         userSockets[userId] = socket.id; // Store the socket ID for the user
//         console.log(`User  registered: ${userId}`);
//     });
//     // Listen for token emission from the frontend
//     socket.on('emit-token', (token) => {
//         console.log(`Received token from frontend: ${token}`);
//         io.emit('receive-token', token);
//     });
//     socket.on('user-logout', (data) => {
//         console.log(`User  logged out:`, data);
//         delete userSockets[data.userName]; // Remove user from userSockets

//         io.emit('user-logout', data); // Notify all clients
//     });
//     socket.on('table-reservation-updated', (room,data) => {
//         console.log(room,data);

//         console.log(`Received table-reservation-updated event:`, data);
//         if (data && typeof data === 'object') {
//             const { tableNumber, isReserved, userId } = data;
//             if (userId && userSockets[userId]) {
//                 // Emit to the specific room if provided, otherwise to the user directly
//                 if (room) {
//                     io.to(room).emit('table-reservation-updated', { tableNumber, isReserved, userId });
//                 } else {
//                     io.emit('table-reservation-updated', { tableNumber, isReserved, userId });
//                 }
//             }else {
//                 console.error(`User  ID ${userId} not found.`);
//             }
//             // io.emit('table-reservation-updated', { tableNumber, isReserved });
//         } else {
//             console.error("Received data is not an object:", data);
//         }
      
//     });
//     socket.on('join-room', (userId) => {
//         socket.join(userId); // Join the room based on userId
//         console.log(`User  ${userId} joined room: ${socket.id}`);
//     });
//     socket.on('disconnect', () => {
//         console.log('Client disconnected:', socket.id);
//     });
// });

// // Function to broadcast token completion status to clients
// export const broadcastTokenCompletion = (completedTokenNumber) => {
//     const message = { status: 'completed', tokenNumber: completedTokenNumber };
//     console.log(`Broadcasting token completion: ${completedTokenNumber}`); // Log the token number being broadcast
//     io.emit('token-updated', message); // Emit to all connected clients
// };


// // Export the io instance for use in other modules
// export { io };

// // Start the server
// server.listen(PORT, async() => {
//     console.log(`Server running on port ${PORT}`);
//         // Clear all reservations for new users
//         await clearReservations();
// });


import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import menuRoutes from './routes/menuRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import mainuserRoutes from './routes/mainuserRoutes.js';
import userRoutes from './routes/userRoutes.js'
import tableorderRoutes from './routes/tableorderRoutes.js';
import User from './models/User.js'
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
app.use('/api/tableorder',tableorderRoutes)
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
        userSockets[userId] = socket.id; // Store the socket ID for the user
        console.log(`User  registered: ${userId}`);
    });
   // Listen for new orders
   socket.on("new-order", (data) => {
    console.log("Received order:", data);
    io.emit("new-order", data); // Emit the order to all clients (admin)
});
    // Listen for token emission from the frontend
    socket.on('emit-token', (token) => {
        console.log(`Received token from frontend: ${token}`);
        io.emit('receive-token', token);
    });
    socket.on('user-logout', (data) => {
        console.log(`User  logged out:`, data);
        delete userSockets[data.userName]; // Remove user from userSockets

        io.emit('user-logout', data); // Notify all clients
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    socket.on('table-reservation-updated', async(data) => {
        console.log(`Received table-reservation-updated event:`, data);
        if (data && typeof data === 'object') {
            const { tableNumber, isReserved, userId } = data;
            const user = await User.findOne({ username: userId });
    if (user && user.isBlocked) {
        console.error(`User  ${userId} is blocked and cannot reserve tables.`);
        return; // Prevent further processing
    }

    // Proceed with the reservation update
    io.emit('table-reservation-updated', { tableNumber, isReserved, userId });
            if (userId && userSockets[userId]) {
                io.to(userSockets[userId]).emit('table-reservation-updated', { tableNumber, isReserved,userId });
            } else {
                console.error(`User  ID ${userId} not found.`);
            }
            // io.emit('table-reservation-updated', { tableNumber, isReserved });
        } else {
            console.error("Received data is not an object:", data);
        }
      
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
export const broadcastTokenCompletion = (completedTokenNumber) => {
    const message = { status: 'completed', tokenNumber: completedTokenNumber };
    console.log(`Broadcasting token completion: ${completedTokenNumber}`); // Log the token number being broadcast
    io.emit('token-updated', message); // Emit to all connected clients
};

export { io };

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});