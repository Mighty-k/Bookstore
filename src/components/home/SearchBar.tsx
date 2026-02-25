import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto lg:mx-0">
      <div className="relative group">
        <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 hover:shadow-xl">
          <Search className="absolute left-5 w-5 h-5 text-gray-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search books, authors, ISBN..."
            className="w-full pl-14 pr-28 py-5 text-gray-800 bg-transparent rounded-full focus:outline-none placeholder-gray-400 text-[15px]"
          />

          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="absolute right-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
