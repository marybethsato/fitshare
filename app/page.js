"use client"; // Ensures this is a Client Component

import Logo from '@/src/components/Logo';
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const navigateToAuth = () => {
    router.push("/auth?mode=signup"); // Redirect to the auth page
  };

  return (
    <div className='max-w-screen overflow-x-hidden'>
      <nav className="bg-white text-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Logo/>
          <div className="flex space-x-4">
            <a href="#" className="hover:bg-yellow-400 px-3 py-2 rounded">Home</a>
            <a href="https://www.linkedin.com/in/marybethsato/" className="hover:bg-yellow-400 px-3 py-2 rounded">Contact</a>
            <a href="/auth?mode=signin" className="hover:bg-yellow-400 px-3 py-2 rounded">Sign in</a>
          </div>
        </div>
      </nav>
      <div className="w-full relative container mx-auto rounded-[20px] overflow-hidden px-5 py-2">
        <div className=" h-0 pb-[48%] relative">
          <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover rounded-[14px]">
            <source src="https://firebasestorage.googleapis.com/v0/b/fitshare-62b84.firebasestorage.app/o/Header.mp4?alt=media&token=87fa9c6e-eb93-41b5-b21f-24589075607c" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="absolute inset-0 flex flex-col justify-center items-start pl-20">
          <p className="[text-shadow:_0_1px_4px_rgb(256_256_256_/_0.7)] text-black text-7xl font-bold mb-2 py-4 leading-[1.2]">Connect and<br />Share your <span className="text-red-700 text-8xl [text-shadow:_0_2px_4px_rgb(256_256_256_/_0.8)]" style={{ fontFamily: 'Satisfy, cursive' }}>Style.</span></p>
          <p className="[text-shadow:_0_1px_4px_rgb(256_256_256_/_0.7)] text-black text-2xl  font-medium mb-10">Discover trends, connect with fashion enthusiasts, <br />and showcase your unique look to the world.</p>
          <button className="bg-red-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg hover:bg-red-900 w-200" onClick={navigateToAuth}>Sign Up Now!</button>

        </div>
      </div>

    </div>
  );
}
