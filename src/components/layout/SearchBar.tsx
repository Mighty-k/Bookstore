import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader, Book } from "lucide-react";
import { GoogleBooksService } from "../../services/googleBooks";
import type { Book as BookType } from "../../types";
import { useDebounce } from "../../hooks/useDebounce";
import { Link } from "react-router-dom";

interface SearchBarProps {
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const searchBooks = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const books = await GoogleBooksService.searchBooks(
          debouncedQuery,
          0,
          5,
        );
        setResults(books);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchBooks();
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleSelectBook = () => {
    onClose();
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSearch} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or ISBN..."
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
        {isLoading && (
          <Loader
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 animate-spin"
            size={20}
          />
        )}
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                onClick={handleSelectBook}
                className="flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <img
                  src={book.coverImage || "/placeholder-book.jpg"}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">
                    {book.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    by {book.authors?.join(", ")}
                  </p>
                  <p className="text-sm font-bold text-blue-600 mt-1">
                    ${book.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSearch}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              See all results for "{query}"
            </button>
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-8 text-center">
          <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No books found for "{query}"</p>
          <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
