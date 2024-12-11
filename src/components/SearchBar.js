"use client";

import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);

    if (value === "") {
      onSearch(""); // Reset search results when the input is cleared
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery); // Perform the search
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search posts or users..."
          value={searchQuery}
          onChange={handleInputChange}
          className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
        >
          Search
        </button>
      </form>
    </div>
  );
}
