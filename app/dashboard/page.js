"use client";

import AuthGuard from "@/src/components/AuthGuard";
import PostCard from "@/src/components/PostCard";
import SearchBar from "@/src/components/SearchBar";
import SideBar from "@/src/components/SideBar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Dashboard() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [newComment, setNewComment] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null); // Track userId
    const [currentUserName, setCurrentUserName] = useState("Sample");
    const [filteredPostResults, setFilteredPostResults] = useState([]); // For post search results
    const [filteredUserResults, setFilteredUserResults] = useState([]); // For user search results
    const [showAllComments, setShowAllComments] = useState({});
    const [modals, setModals] = useState({});

    const toggleModal = (postId, type) => {
        setModals((prev) => ({
            ...prev,
            [postId]: {
                ...prev[postId],
                [type]: !prev[postId]?.[type],
            },
        }));
    };

    const fetchData = async () => {
        try {
            const postsResponse = await fetch("/api/posts");
            const postsData = await postsResponse.json();
            setPosts(postsData);
            setFilteredPostResults(postsData); // Default to all posts
            setFilteredUserResults([]); // Reset user results
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setIsLoading(false);
        }
    };

    const handleFollowToggle = async (userId, isFollowed) => {
        try {
            // Optimistically update UI
            setFilteredUserResults((prev) =>
                prev.map((user) => {
                    if (user.id === userId) {
                        const updatedFollowers = isFollowed
                            ? user.followers.filter((id) => id !== currentUserId)
                            : [...user.followers, currentUserId];
                        return { ...user, followers: updatedFollowers };
                    }
                    return user;
                })
            );

            // Determine the API endpoint
            const endpoint = isFollowed
                ? `/api/users/${userId}/unfollow`
                : `/api/users/${userId}/follow`;

            // Send the follow/unfollow request
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentUserId }),
            });

            if (!response.ok) {
                throw new Error("Failed to toggle follow state.");
            }
        } catch (error) {
            console.error("Error toggling follow state:", error);
            alert("An error occurred while trying to update the follow state.");

            // Revert UI update on error
            setFilteredUserResults((prev) =>
                prev.map((user) => {
                    if (user.id === userId) {
                        const revertedFollowers = isFollowed
                            ? [...user.followers, currentUserId]
                            : user.followers.filter((id) => id !== currentUserId);
                        return { ...user, followers: revertedFollowers };
                    }
                    return user;
                })
            );
        }
    };


    useEffect(() => {

        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName") || "Unknown"; // Fallback if userName is missing
        setCurrentUserId(userId);
        setCurrentUserName(userName);
        fetchData();
    }, []);

    const handleCommentChange = (e, postId) => {
        const { value } = e.target;
        setNewComment((prev) => ({
            ...prev,
            [postId]: value, // Update the comment for the specific post ID
        }));
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comment`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete comment.");
            }

            // Update the comments locally
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            comments: post.comments.filter((comment) => comment.id !== commentId),
                        }
                        : post
                )
            );
            await fetchData();
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleLikeToggle = async (postId, isLiked) => {

        try {

            if (!currentUserId || !currentUserName) {
                alert("You need to log in to like/unlike a post.");
                return;
            }

            // Determine the API endpoint and method based on `isLiked`
            const endpoint = isLiked ? `/api/posts/${postId}/unlike` : `/api/posts/${postId}/like`;

            // Make API call
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, userName: currentUserName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to toggle like.");
            }


            // Update the local UI
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            likes: isLiked ? post.likes - 1 : post.likes + 1,
                            likedBy: isLiked
                                ? post.likedBy.filter((user) => user.userId !== currentUserId)
                                : [...post.likedBy, { userId: currentUserId, userName: currentUserName }],
                        }
                        : post
                )
            );
            await fetchData();
        } catch (error) {
            console.error("Error toggling like:", error);
            alert(error.message || "An error occurred while toggling like.");
        }
    };



    // Handle Comment Submit
    const handleCommentSubmit = async (postId, text) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, userName: currentUserName, commentText: text }),
            });

            if (!response.ok) {
                throw new Error("Failed to add comment.");
            }

            const { comment } = await response.json();

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
                )
            );

            setNewComment((prev) => ({ ...prev, [postId]: "" }));
            await fetchData();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // Search Handler
    const handleSearch = async (query) => {
        setSearchText(query);

        if (!query) {
            setFilteredPostResults(posts); // Reset to default posts if no query
            setFilteredUserResults([]); // Reset user results
            return;
        }

        try {
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setFilteredPostResults(data.posts || []); // Update post results
            setFilteredUserResults(data.users || []); // Update user results
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-gray-100 ml-[250px]">
                <div className="sidebar">
                    <SideBar activeIndex={0} />
                </div>
                <div className="flex-1 p-6">

                    <SearchBar onSearch={handleSearch} />
                    {searchText == '' ? null : <h2 className="text-3xl font-bold text-gray-800 mt-2">Results</h2>}


                    {isLoading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : (
                        <div className="flex flex-col gap-2 mt-4">
                            {/* Users Section */}
                            {searchText == '' ? null : <h3 className="text-2xl font-bold text-gray-800">Users</h3>}

                            {filteredUserResults.map((user) => {
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


                            {/* Posts Section */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Posts</h3>

                                    <button
                                        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                                        onClick={() => router.push("/createPost")}
                                    >
                                        Create Post
                                    </button>
                                </div>

                                {filteredPostResults.length === 0 ? (
                                    <p className="text-center text-gray-500">No posts found.</p>
                                ) : (
                                    <div className="flex flex-col gap-6 items-center">

                                        {filteredPostResults.map((post) => {
                                            const isLiked = post.likedBy?.some((user) => user.userId === currentUserId);
                                            return PostCard({
                                                key: post.id,
                                                router: router,
                                                authorUserId: post.userId,
                                                postId: post.id,
                                                authorName: post.author || "Unknown",
                                                postText: post.description || "No text available.",
                                                postImage: post.imageUrl,
                                                datePosted: post.createdAt || "Unknown date",
                                                comments: post.comments || [],
                                                likes: post.likedBy || [],
                                                isLiked: isLiked,
                                                newComment: newComment,
                                                showModal: modals[post.id]?.showModal || false,
                                                showLikesModal: modals[post.id]?.showLikesModal || false,
                                                toggleModal: toggleModal,
                                                handleCommentChange: handleCommentChange,
                                                handleDeleteComment: handleDeleteComment,
                                                handleLikeToggle: handleLikeToggle,
                                                handleCommentSubmit: handleCommentSubmit,
                                                showAllComments: showAllComments[post.id] || false,
                                                setShowAllComments: (value) =>
                                                    setShowAllComments((prev) => ({ ...prev, [post.id]: value }))

                                            });



                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
