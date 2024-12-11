'use client';

import AuthGuard from "@/src/components/AuthGuard";
import SideBar from "@/src/components/SideBar";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePageContent() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setCurrentUserId(id);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchProfile = async () => {
      const userId = searchParams.get("userId") || currentUserId;

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
  }, [searchParams, currentUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      alert("Unable to determine current user ID.");
      return;
    }

    try {
      const userId = searchParams.get("userId") || currentUserId;
      const endpoint = isFollowed
        ? `/api/users/${userId}/unfollow`
        : `/api/users/${userId}/follow`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUserId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle follow state.");
      }

      setIsFollowed(!isFollowed);
      setProfile((prevProfile) => ({
        ...prevProfile,
        followers: isFollowed
          ? prevProfile.followers.filter((id) => id !== currentUserId)
          : [...prevProfile.followers, currentUserId],
      }));
    } catch (error) {
      console.error("Error toggling follow state:", error);
      alert("An error occurred while trying to update the follow state.");
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100 ml-[250px]">
        <SideBar activeIndex={searchParams.get("userId") == null ? 1 : 2} />

        {isLoading ? (
          <div className="text-center text-gray-500 p-6">Loading profile...</div>
        ) : error ? (
          <div className="text-center text-red-500 p-6">Error: {error}</div>
        ) : (
          <div className="flex-1 p-6">
            <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
              <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <button
                className={`px-4 py-2 rounded-md text-white ${isFollowed ? "bg-red-500" : "bg-green-500"}`}
                onClick={handleFollowToggle}
              >
                {isFollowed ? "Unfollow" : "Follow"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
