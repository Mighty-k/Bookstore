import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  BookOpen,
  Search,
  //   Coffee,
  Wrench,
  Hammer,
  //   Zap,
  Smile,
  Meh,
  Frown,
} from "lucide-react";

const NotFound: React.FC = () => {
  const [mood, setMood] = useState<"happy" | "neutral" | "sad">("neutral");
  const [showTooltip, setShowTooltip] = useState(false);
  const [bounceCount, setBounceCount] = useState(0);

  // Cycle through moods for fun
  useEffect(() => {
    const interval = setInterval(() => {
      const moods: ["happy", "neutral", "sad"] = ["happy", "neutral", "sad"];
      const randomIndex = Math.floor(Math.random() * moods.length);
      setMood(moods[randomIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getMoodIcon = () => {
    switch (mood) {
      case "happy":
        return <Smile className="w-12 h-12 text-yellow-500" />;
      case "sad":
        return <Frown className="w-12 h-12 text-blue-500" />;
      default:
        return <Meh className="w-12 h-12 text-gray-500" />;
    }
  };

  const handleBookClick = () => {
    setBounceCount((prev) => prev + 1);
    if (bounceCount >= 5) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 py-10">
      <div className="max-w-2xl w-full text-center relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-10 right-10 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 left-1/2 w-20 h-20 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>

        {/* 404 Number with animation */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </h1>
          <div className="absolute -top-4 -right-4 animate-bounce">
            <div className="relative">
              <BookOpen className="w-16 h-16 text-yellow-500" />
              <span className="absolute -top-2 -right-2 text-2xl animate-spin">
                🔨
              </span>
            </div>
          </div>
        </div>

        {/* Playful message with construction theme */}
        <div className="relative mb-8 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Oops! This page is{" "}
            <span className="bg-yellow-200 px-4 py-2 rounded-lg inline-block transform rotate-1 hover:rotate-0 transition-transform">
              under construction
            </span>
          </h2>

          <div className="flex items-center justify-center gap-4 text-xl text-gray-600">
            <Wrench className="w-8 h-8 text-gray-500 animate-spin-slow" />
            <span>Our bookworms are working hard</span>
            <Hammer className="w-8 h-8 text-gray-500 animate-bounce" />
          </div>

          <p className="text-lg text-gray-500 max-w-md mx-auto">
            We're building something amazing here!
            <br />
            Maybe try one of these instead:
          </p>
        </div>

        {/* Interactive book character */}
        <div className="relative mb-12">
          <button
            onClick={handleBookClick}
            className="group relative inline-block transform hover:scale-110 transition-transform"
          >
            <div className="relative">
              <BookOpen className="w-24 h-24 text-blue-600" />
              <div className="absolute -top-2 -right-2">{getMoodIcon()}</div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                {showTooltip && (
                  <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                    Stop poking me! 😅
                  </span>
                )}
              </div>
            </div>
          </button>
          <p className="text-sm text-gray-400 mt-2">
            (click the book for a surprise!)
          </p>
        </div>

        {/* Navigation options with playful design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Link
            to="/"
            className="group bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Home className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:animate-bounce" />
            <span className="text-gray-700 font-medium">Home</span>
          </Link>

          <Link
            to="/catalog"
            className="group bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Search className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:animate-bounce" />
            <span className="text-gray-700 font-medium">Browse Books</span>
          </Link>
        </div>

        {/* Fun fact or joke */}
        <div className="mt-12 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 italic">
            "Did you know? The first book ever written on this page was{" "}
            <span className="font-bold text-gray-700">"The Lost Page"</span>
            {bounceCount > 3 && " — but we lost it again! 📚"}
          </p>
        </div>

        {/* Easter egg for persistent clickers */}
        {bounceCount > 10 && (
          <div className="mt-4 animate-bounce">
            <span className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full text-sm">
              🎉 You found the secret message! You're our most curious reader!
              🎉
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
