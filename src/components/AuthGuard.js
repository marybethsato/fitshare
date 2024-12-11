"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/auth"); // Redirect to login page if not authenticated
    }
  }, [router]);

  // Render children only if authenticated
  return children;
}
