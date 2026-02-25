import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Laptop,
  Heart,
  Zap,
  Coffee,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import BookGrid from "../components/books/BookGrid";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import { OpenLibraryService } from "../services/openLibrary";
import type { Book, FilterOptions } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import toast from "react-hot-toast";

// Rich category data from CategoryMenu
const categories = [
  {
    name: "Fiction",
    icon: BookOpen,
    subcategories: [
      "Classics",
      "Science Fiction",
      "Fantasy",
      "Mystery",
      "Romance",
      "Horror",
    ],
    color: "blue",
  },
  {
    name: "Non-Fiction",
    icon: BookOpen,
    subcategories: [
      "Biography",
      "History",
      "Science",
      "Self-Help",
      "Business",
      "Travel",
    ],
    color: "green",
  },
  {
    name: "Technology",
    icon: Laptop,
    subcategories: [
      "Programming",
      "Web Development",
      "AI & Machine Learning",
      "Cybersecurity",
      "Data Science",
    ],
    color: "purple",
  },
  {
    name: "Children's Books",
    icon: Heart,
    subcategories: [
      "Picture Books",
      "Early Readers",
      "Middle Grade",
      "Young Adult",
    ],
    color: "pink",
  },
  {
    name: "Comics & Graphic Novels",
    icon: Zap,
    subcategories: ["Superhero", "Manga", "Graphic Novels", "Comic Strips"],
    color: "orange",
  },
  {
    name: "Academic",
    icon: Coffee,
    subcategories: ["Textbooks", "Test Prep", "Study Guides", "Reference"],
    color: "red",
  },
];

// Color mapping for badges
const colorClasses = {
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-green-100 text-green-800 border-green-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  pink: "bg-pink-100 text-pink-800 border-pink-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200",
};

const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.name),
  );
  const [filters, setFilters] = useState<FilterOptions>({
    categories: searchParams.getAll("category") || [],
    priceRange: [
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 100,
    ],
    minRating: Number(searchParams.get("minRating")) || 0,
    sortBy: (searchParams.get("sortBy") as FilterOptions["sortBy"]) || "newest",
  });
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const booksPerPage = 20;

  // Update URL when search query or filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    if (filters.categories.length > 0) {
      filters.categories.forEach((cat) => params.append("category", cat));
    }

    if (filters.priceRange[0] > 0) {
      params.set("minPrice", filters.priceRange[0].toString());
    }

    if (filters.priceRange[1] < 100) {
      params.set("maxPrice", filters.priceRange[1].toString());
    }

    if (filters.minRating > 0) {
      params.set("minRating", filters.minRating.toString());
    }

    if (filters.sortBy !== "newest") {
      params.set("sortBy", filters.sortBy);
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    setSearchParams(params, { replace: true });
  }, [searchQuery, filters, currentPage, setSearchParams]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedBooks: Book[] = [];
      let total = 0;

      const queryToUse = debouncedSearch || searchParams.get("search") || "";

      if (queryToUse) {
        const result = await OpenLibraryService.searchBooks(
          queryToUse,
          currentPage,
          booksPerPage,
        );
        fetchedBooks = result.books;
        total = result.total;
      } else if (filters.categories.length > 0) {
        // Use the first selected category for subject search
        const category = filters.categories[0];
        fetchedBooks = await OpenLibraryService.getBooksBySubject(
          category,
          booksPerPage,
          currentPage,
        );
        total = fetchedBooks.length;
      } else {
        fetchedBooks = await OpenLibraryService.getTrendingBooks(booksPerPage);
        total = fetchedBooks.length;
      }

      // Apply client-side filters
      let filteredBooks = fetchedBooks;

      // Category filter (match against main categories and subcategories)
      if (filters.categories.length > 0) {
        filteredBooks = filteredBooks.filter((book) =>
          book.categories?.some((bookCat) =>
            filters.categories.some(
              (selectedCat) =>
                bookCat.toLowerCase().includes(selectedCat.toLowerCase()) ||
                selectedCat.toLowerCase().includes(bookCat.toLowerCase()),
            ),
          ),
        );
      }

      // Rating filter
      if (filters.minRating > 0) {
        filteredBooks = filteredBooks.filter(
          (book) => (book.rating || 0) >= filters.minRating,
        );
      }

      // Price filter
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.price >= filters.priceRange[0] &&
          book.price <= filters.priceRange[1],
      );

      // Apply sorting
      filteredBooks.sort((a, b) => {
        switch (filters.sortBy) {
          case "price_asc":
            return (a.price || 0) - (b.price || 0);
          case "price_desc":
            return (b.price || 0) - (a.price || 0);
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "newest":
            return (b.publishedDate || "").localeCompare(a.publishedDate || "");
          case "popularity":
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });

      setBooks(filteredBooks);
      setTotalBooks(total);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, currentPage, booksPerPage, searchParams]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch || "");
    }
  }, [searchParams]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => {
      const categoryLower = category.toLowerCase();
      const newCategories = prev.categories.includes(categoryLower)
        ? prev.categories.filter((c) => c !== categoryLower)
        : [...prev.categories, categoryLower];

      return { ...prev, categories: newCategories };
    });
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters((prev) => ({ ...prev, priceRange: [min, max] }));
    setCurrentPage(1);
  };

  const handleRatingChange = (rating: number) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: FilterOptions["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 100],
      minRating: 0,
      sortBy: "newest",
    });
    setSearchQuery("");
    setCurrentPage(1);
    navigate("/catalog", { replace: true });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalPages = Math.ceil(totalBooks / booksPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Book Catalog"}
          </h1>
          <p className="text-gray-600 mt-2">
            {!loading && totalBooks > 0
              ? `Found ${totalBooks} books`
              : "Discover your next favorite book from our collection"}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search books by title, author, or subject..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-1 focus:ring-blue-500 focus:border-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories with Subcategories */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isExpanded = expandedCategories.includes(
                      category.name,
                    );
                    const isSelected = filters.categories.includes(
                      category.name.toLowerCase(),
                    );

                    return (
                      <div
                        key={category.name}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Main Category */}
                        <div
                          className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleCategory(category.name)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-lg ${colorClasses[category.color as keyof typeof colorClasses]}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleCategoryToggle(category.name);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {/* Subcategories */}
                        {isExpanded && (
                          <div className="pl-11 pr-3 pb-2 space-y-1 bg-gray-50">
                            {category.subcategories.map((sub) => (
                              <label
                                key={sub}
                                className="flex items-center py-1.5 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.categories.includes(
                                    sub.toLowerCase(),
                                  )}
                                  onChange={() => handleCategoryToggle(sub)}
                                  className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                  {sub}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ${filters.priceRange[0]}
                    </span>
                    <span className="text-gray-600">
                      ${filters.priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      handlePriceRangeChange(0, parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        handlePriceRangeChange(
                          parseInt(e.target.value) || 0,
                          filters.priceRange[1],
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        handlePriceRangeChange(
                          filters.priceRange[0],
                          parseInt(e.target.value) || 100,
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Minimum Rating
                </h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`px-3 py-1 rounded-full ${
                        filters.minRating === rating
                          ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-500"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
                      }`}
                    >
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    handleSortChange(e.target.value as FilterOptions["sortBy"])
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </button>

                {filters.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {cat}
                        <button
                          onClick={() => handleCategoryToggle(cat)}
                          className="hover:text-blue-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-gray-600">
                {loading
                  ? "Loading..."
                  : `Showing ${books.length} of ${totalBooks} books`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-80" />
                ))}
              </div>
            ) : books.length > 0 ? (
              <>
                <BookGrid books={books} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No books found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
