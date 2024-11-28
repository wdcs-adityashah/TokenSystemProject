// Totaluser.tsx
'use client'
import React, { useState, useEffect } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    blocked: boolean; // Add blocked field
}

const Totaluser = () => {
    const [users, setUsers] = useState<User[]>([]); // State for users

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:2000/api/register");
                const data = await response.json();
                console.log("Fetched users:", data); // Log the fetched data

                // Ensure data is an array
                if (Array.isArray(data)) {
                    setUsers(data);
                    console.log(data);
                } else {
                    console.error("Expected an array but received:", data);
                    setUsers([]);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleBlockUser  = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:2000/api/block/${userId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to block user');
            }

            // Update the users state to reflect the blocked status
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, blocked: true } : user
                )
            );
        } catch (error) {
            console.error("Error blocking user:", error);
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
                                        {!user.blocked && (
                                            <button
                                                onClick={() => handleBlockUser (user._id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded transition duration-300 hover:opacity-80"
                                            >
                                                Block User
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