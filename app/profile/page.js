"use client";

import AuthGuard from "@/src/components/AuthGuard";
import SideBar from "@/src/components/SideBar"; // Adjust the import path based on your project structure
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = searchParams.get("userId") || localStorage.getItem("userId");
      const currentUserId = localStorage.getItem("userId");

      if (!userId) {
        setError("User ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users?userId=${userId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);

        // Check if the current user follows this profile user
        setIsFollowed(data.followers.includes(currentUserId));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [searchParams]);

  const handleFollowToggle = async () => {
    const userId = searchParams.get("userId") || localStorage.getItem("userId");
    const currentUserId = localStorage.getItem("userId");

    if (!userId || !currentUserId) {
      alert("Unable to determine user or current user ID.");
      return;
    }

    try {
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

      // Update the follow state
      setIsFollowed(!isFollowed);

      // Optionally, update the followers count in the profile state
      setProfile((prevProfile) => {
        if (!prevProfile) return prevProfile;

        const updatedFollowers = isFollowed
          ? prevProfile.followers.filter((id) => id !== currentUserId)
          : [...prevProfile.followers, currentUserId];

        return { ...prevProfile, followers: updatedFollowers };
      });
    } catch (error) {
      console.error("Error toggling follow state:", error);
      alert("An error occurred while trying to update the follow state.");
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100 ml-[250px]">
      {/* Sidebar */}
      <div className="sidebar">
        <SideBar activeIndex={searchParams.get("userId") == null ? 1 : 2} />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 p-6">Loading profile...</div>
      ) : error ? (
        <div className="text-center text-red-500 p-6">Error: {error}</div>
      ) : (
        <div className="flex-1 p-6">
          {/* Profile Content */}

          {/* Profile Header */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
            <p className="text-gray-600">{profile.email}</p>
            <div className="mt-4 flex space-x-6">
              <div>
                <span className="block text-2xl font-bold text-gray-800">
                  {profile.followers.length || 0}
                </span>
                <span className="text-gray-600">Followers</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-gray-800">
                  {profile.following.length || 0}
                </span>
                <span className="text-gray-600">Following</span>
              </div>
            </div>
            {/* Follow/Unfollow Button */}
            {localStorage.getItem("userId") == searchParams.get("userId") ? null : <div className="mt-4">
              <button
                className={`px-4 py-2 rounded-md text-white ${isFollowed ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                onClick={handleFollowToggle}
              >
                {isFollowed ? "Unfollow" : "Follow"}
              </button>
            </div>}
          </div>

          {/* User Posts */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-800">User Posts</h2>
            {profile.posts.length === 0 ? (
              <div className="text-center text-gray-500">This user has no posts yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-3">
                {profile.posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.description}
                        className="mb-4 h-80 w-full rounded-lg object-cover"
                      />
                    )}
                    <h3 className="text-medium font-medium text-gray-800">
                      {post.description}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Likes:</strong> {post.likes}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Comments:</strong> {post.commentsCount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}