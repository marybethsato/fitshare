"use client";

import Logo from '@/src/components/Logo';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const router = useRouter();

  const toggleMode = () => setIsLogin(!isLogin);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {

    const query = new URLSearchParams(window.location.search);
    const mode = query.get('mode');
    setIsLogin(mode !== 'signup'); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Save token to localStorage (or use cookies)
        console.log(`NAME: ${data.name || "Unknown"}`);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", data.name);

        // Redirect to dashboard
        router.push("/dashboard");

      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };
  return (
    <div className="flex h-screen bg-white">


      <div className="w-1/2 bg-white flex flex-col justify-center p-12 px-20 relative">
        <div className="absolute top-4 left-4">
          <Logo/>
        </div>
        <h1 className="text-3xl font-bold mb-4">
          {isLogin ? 'Welcome Back!' : 'Join FitShare Today!'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isLogin
            ? 'Please sign in to continue.'
            : 'Discover, connect, and share your fitness journey with a community that inspires and supports you.'}
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input
                type="text"
                name="name"
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="janedoe@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md shadow-lg hover:bg-blue-600"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? 'New to our platform?' : 'Already have an account?'}{' '}
            <button
              onClick={toggleMode}
              className="font-medium text-blue-500 hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Column: Illustration */}
      <div className="w-1/2 flex items-center justify-center py-4">
        <Image
          src="/assets/auth/main.jpg"
          alt="Signup Illustration"
          width={600}
          height={800}
          className="h-full w-auto rounded-md"
        />
      </div>
    </div>
  );

}
