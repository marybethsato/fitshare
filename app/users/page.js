"use client";

import AuthGuard from "@/src/components/AuthGuard";
import Sidebar from "@/src/components/SideBar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/users");
                const data = await res.json();

                if (res.ok) {
                    setUsers(data);
                } else {
                    console.error("Error fetching users:", data.error);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch current user ID from localStorage
        const userId = localStorage.getItem("userId");
        setCurrentUserId(userId);

        fetchUsers();
    }, []);

    const handleFollowToggle = async (userId, isFollowed) => {
        try {
            const endpoint = isFollowed
                ? `/api/users/${userId}/unfollow`
                : `/api/users/${userId}/follow`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentUserId }),
            });

            if (res.ok) {
                // Optimistically update UI
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === userId
                            ? {
                                ...user,
                                followers: isFollowed
                                    ? user.followers.filter((id) => id !== currentUserId)
                                    : [...user.followers, currentUserId],
                            }
                            : user
                    )
                );
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to update follow state.");
            }
        } catch (error) {
            console.error("Error toggling follow state:", error);
            alert("An error occurred while updating the follow state.");
        }
    };

    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-gray-100  ml-[250px]">
                {/* Sidebar */}
                <div className="sidebar">
                    <Sidebar activeIndex={2}></Sidebar>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Users</h1>
                    {isLoading ? (
                        <p className="text-center text-gray-500">Loading users...</p>
                    ) : (
                        <ul className="space-y-4">
                            {users.map((user) => {
                                const isYou = user.id == currentUserId;
                                const isFollowed = user.followers.includes(currentUserId);
                                return (
                                    <li
                                        key={user.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold"
                                                onClick={() => router.push(`/profile?userId=${user.id}`)}
                                            >
                                                {user.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p
                                                    className="font-semibold text-gray-800"
                                                    onClick={() => router.push(`/profile?userId=${user.id}`)}
                                                >
                                                    {user.name} {isYou ? '(You)' : ''}
                                                </p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                            </div>
                                        </div>
                                        {
                                            isYou ? null : <button
                                                className={`px-4 py-2 rounded-md text-white ${isFollowed
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-green-500 hover:bg-green-600"
                                                    }`}
                                                onClick={() => handleFollowToggle(user.id, isFollowed)}
                                            >
                                                {isFollowed ? "Unfollow" : "Follow"}
                                            </button>
                                        }

                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
