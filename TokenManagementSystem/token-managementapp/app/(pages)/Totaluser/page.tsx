// Totaluser.tsx
'use client'
import React, { useState, useEffect,useRef } from 'react';
import { io, Socket } from "socket.io-client"; // Import socket.io-client
interface User {
    _id: string;
    name: string;
    email: string;
    blocked: boolean; // Add blocked field
}

const Totaluser = () => {
    const [users, setUsers] = useState<User[]>([]); // State for users
    const socketRef = useRef<Socket | null>(null); // Use useRef to store the socket instance
    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io("http://localhost:2000");

        // Log when the socket connects
        socketRef.current.on("connect", () => {
            console.log("Socket connected:", socketRef.current?.id);
        });

        // Handle user-blocked event
        socketRef.current.on("user-blocked", (data) => {
            console.log(`User  blocked: ${JSON.stringify(data)}`);
            // Update user state to reflect the blocked status
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === data.userId ? { ...user, blocked: true } : user
                )
            );
        });

        // Fetch users on component mount
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:2000/api/register");
                const data = await response.json();
                console.log("Fetched users:", data); // Log the fetched data

                // Ensure data is an array
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error("Expected an array but received:", data);
                    setUsers([]);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();

        // Cleanup on component unmount
        return () => {
            socketRef.current?.off("user-blocked"); // Remove event listener
            socketRef.current?.disconnect(); // Disconnect the socket
        };
    }, []); // Empty dependency array ensures this effect runs once on mount



    const handleBlockUser  = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:2000/api/block/${userId}`, {
                method: 'POST',
            });
    
            if (!response.ok) {
                throw new Error('Failed to block user');
            }
    
            // Remove the user's token from local storage
            const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
            blockedUsers.push(userId); // Add the blocked user ID
            localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers));
                    // Dispatch a logout event
            window.dispatchEvent(new Event('userLoggedOut'));
    
            // Update user state to reflect the blocked status
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, blocked: true } : user
                )
            );
    
        } catch (error) {
            console.error("Error blocking user:", error);
        }
    };

    const handleUnblockUser  = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:2000/api/unblock/${userId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to unblock user');
            }

            // Update user state to reflect the unblocked status
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, blocked: false } : user
                )
            );

        } catch (error) {
            console.error("Error unblocking user:", error);
        }
    };

    

    return (
        <div>
            <h2 className="text-3xl font-bold mt-8 text-center">Registered Users</h2>
            <div className="overflow-x-auto mt-4">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="border px-4 py-2">Name</th>
                            <th className="border px-4 py-2">Email</th>
                            <th className="border px-4 py-2">Blocked</th>
                            <th className="border px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id} className="border-b hover:bg-gray-100">
                                    <td className="border px-4 py-2">{user.name}</td>
                                    <td className="border px-4 py-2">{user.email}</td>
                                    <td className="border px-4 py-2">
                                        {user.blocked ? "Yes" : "No"}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {!user.blocked ? (
                                            <button
                                                onClick={() => handleBlockUser (user._id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded transition duration-300 hover:opacity-80"
                                            >
                                                Block User
                                            </button>
                                        ):(
                                            <button
                                            onClick={() => handleUnblockUser (user._id)}
                                            className="bg-green-500 text-white px-4 py-2 rounded transition duration-300 hover:opacity-80"
                                        >
                                            Unblock User
                                        </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-4 text-red-500">
                                    No users registered.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Totaluser;