import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  BookOpen,
  Laptop,
  Heart,
  Zap,
  Coffee,
  Sparkles,
} from "lucide-react";

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

const CategoryMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
        <span>Categories</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 py-4 animate-fadeIn z-50">
          <div className="grid grid-cols-2 gap-4 p-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const colorClasses = {
                blue: "text-blue-600 bg-blue-50",
                green: "text-green-600 bg-green-50",
                purple: "text-purple-600 bg-purple-50",
                pink: "text-pink-600 bg-pink-50",
                orange: "text-orange-600 bg-orange-50",
                red: "text-red-600 bg-red-50",
              }[category.color];

              return (
                <div key={category.name} className="group">
                  <Link
                    to={`/catalog?category=${category.name.toLowerCase()}`}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </span>
                  </Link>

                  <div className="ml-12 mt-1 space-y-1">
                    {category.subcategories.slice(0, 4).map((sub) => (
                      <Link
                        key={sub}
                        to={`/catalog?category=${category.name.toLowerCase()}&sub=${sub.toLowerCase()}`}
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                    {category.subcategories.length > 4 && (
                      <Link
                        to={`/catalog?category=${category.name.toLowerCase()}`}
                        className="block text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        View all →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Featured Category Banner */}
          <div className="mt-2 p-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Featured Category
                </p>
                <p className="text-xl font-bold mt-1">Summer Reading Sale</p>
                <p className="text-sm opacity-90 mt-1">
                  Up to 40% off on Fiction
                </p>
              </div>
              <Link
                to="/catalog?category=fiction&sale=true"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;
