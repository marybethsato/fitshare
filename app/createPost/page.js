"use client";

import AuthGuard from "@/src/components/AuthGuard";
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { useState } from "react";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);


export default function CreatePost() {
    const [formData, setFormData] = useState({
        image: null,
        description: "",
        tags: "",
    });

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > MAX_FILE_SIZE) {
            setError("File size exceeds 10MB. Please upload a smaller file.");
            setFormData({ ...formData, image: null });
            return;
        }
        setError(null);
        setFormData({ ...formData, image: file });
        console.log("SET IMAGE");
    };

    const uploadImageToFirebase = async (file) => {
        return new Promise((resolve, reject) => {
            // Create a storage reference
            const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Monitor upload progress
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Calculate and update progress percentage
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`); // Debugging
                    setUploadProgress(progress.toFixed(0)); // Update progress state
                },
                (error) => {
                    // Handle upload errors
                    console.error("Upload failed:", error);
                    reject(error);
                },
                async () => {
                    // Handle successful upload
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("File available at", downloadURL); // Debugging
                    resolve(downloadURL);
                }
            );
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");
        setError(null);
        setUploadProgress(0);

        if (!formData.image) {
            setError("Please upload an image.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Upload the image to Firebase Storage
            setIsUploading(true);
            const imageUrl = await uploadImageToFirebase(formData.image);
            setIsUploading(false);

            // Send the image URL and other data to the API
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageUrl: imageUrl,
                    userId: localStorage.getItem("userId"),
                    description: formData.description,
                    author: localStorage.getItem("userName"),
                    tags: ['style', 'sample'],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to upload post.");
            }


            setMessage("Post uploaded successfully!");
            setFormData({
                image: null,
                description: "",
                tags: "",
            });
        } catch (error) {
            setIsUploading(false);
            console.error("Error uploading post:", error);
            setError("Error: Unable to upload post.");
        } finally {
            setIsUploading(false);
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-full max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
                    <h1 className="text-2xl font-bold mb-4">Upload a New Post</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Upload Image
                            </label>
                            <input
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring focus:ring-blue-300"
                                required
                            />
                            {error && formData.image === null && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40"
                                rows="4"
                                required
                            ></textarea>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40"
                            />
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                            >
                                {isUploading
                                    ? `Uploading Image... (${uploadProgress}%)`
                                    : isSubmitting
                                        ? "Uploading Post..."
                                        : "Upload Post"}
                            </button>
                        </div>


                    </form>


                    {/* Feedback Messages */}
                    {message && (
                        <p className="mt-4 text-center text-green-600">
                            {message}
                        </p>
                    )}
                    {error && !formData.image && (
                        <p className="mt-4 text-center text-red-600">
                            {error}
                        </p>
                    )}

                    {/* Back Button */}
                    <div className="pt-2">
                        <button
                            onClick={() => router.back()}
                            className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                        >
                            Back Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
