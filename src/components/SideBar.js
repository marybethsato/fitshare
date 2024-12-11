"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Sidebar({ activeIndex }) {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { name: "Home", path: "/dashboard" },
        { name: "My Profile", path: "/profile" },
        { name: "Users", path: "/users" },
    ];

    const handleSignOut = () => {
        localStorage.removeItem("authToken");
        router.push("/");
    };

    return (
        <div className="h-screen w-[250px] bg-blue-500 text-white flex flex-col items-start p-4">
            <h1 className="text-2xl font-bold mb-6">FitShare</h1>
            <nav className="flex flex-col space-y-4 w-full">
                {menuItems.map((item, index) => (
                    <button
                        key={item.path}
                        className={`w-full text-left text-lg py-2 px-3 rounded-lg ${
                            (activeIndex === index)
                                ? "bg-blue-700"
                                : "hover:bg-blue-600"
                        }`}
                        onClick={() => router.push(item.path)}
                    >
                        {item.name}
                    </button>
                ))}
                <button
                    className="w-full text-left text-lg py-2 px-3 rounded-lg hover:bg-blue-600"
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
            </nav>
        </div>
    );
}
