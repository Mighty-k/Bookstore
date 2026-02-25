import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Zap,
  Heart,
  Users,
  Truck,
  Shield,
  RotateCcw,
  Gift,
  RefreshCw,
} from "lucide-react";
import type {} from /* Book */ "../types";
import BookGrid from "../components/books/BookGrid";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Rating from "../components/ui/Rating";
import SearchBar from "../components/home/SearchBar";
import Alert from "../components/ui/Alert";
import { useHomeStore } from "../store/homeStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

const Home: React.FC = () => {
  const {
    featuredBooks,
    newReleases,
    bestsellers,
    isLoading,
    error,
    fetchHomeData,
  } = useHomeStore();

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const handleRetry = () => {
    fetchHomeData(true); // Force refresh
  };

  const categories = [
    { name: "Fiction", icon: BookOpen, color: "blue", count: 1234 },
    { name: "Non-Fiction", icon: BookOpen, color: "green", count: 987 },
    { name: "Technology", icon: Zap, color: "purple", count: 456 },
    { name: "Children's Books", icon: Heart, color: "pink", count: 789 },
    { name: "Academic", icon: Users, color: "orange", count: 234 },
    { name: "Romance", icon: Heart, color: "red", count: 567 },
  ];

  const features = [
    { icon: Truck, title: "Free Shipping", description: "On orders over $25" },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "256-bit encryption",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day return policy",
    },
    { icon: Gift, title: "Gift Cards", description: "Available now" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?u=1",
      rating: 5,
      comment:
        "BookHaven has the best selection of books! I found rare titles I couldn't find anywhere else.",
      role: "Book Lover",
    },
    {
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?u=2",
      rating: 5,
      comment:
        "Amazing customer service and fast shipping. My go-to place for all my reading needs.",
      role: "Tech Professional",
    },
    {
      name: "Emily Davis",
      avatar: "https://i.pravatar.cc/150?u=3",
      rating: 5,
      comment:
        "The recommendations are spot-on! I've discovered so many great books through this store.",
      role: "Book Club Member",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Discover Your Next
                <span className="block text-yellow-300">Great Read</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg mx-auto lg:mx-0">
                Explore millions of books across all genres. From bestsellers to
                hidden gems, find your perfect story.
              </p>

              <SearchBar />

              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-blue-200">Books</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-blue-200">Happy Readers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">20+</div>
                  <div className="text-blue-200">Categories</div>
                </div>
              </div>
            </div>

            {/* Hero Image Carousel */}
            <div className="hidden lg:block">
              {featuredBooks.length > 0 ? (
                <Swiper
                  modules={[Autoplay, Pagination]}
                  spaceBetween={30}
                  slidesPerView={1}
                  autoplay={{ delay: 3000 }}
                  pagination={{ clickable: true }}
                  className="rounded-xl shadow-2xl"
                >
                  {featuredBooks.slice(0, 3).map((book) => (
                    <SwiperSlide key={book.id}>
                      <Link to={`/book/${book.id}`}>
                        <div className="aspect-w-3 aspect-h-4">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="w-full h-96 bg-blue-500 rounded-xl flex items-center justify-center">
                  <p className="text-white text-lg">
                    Loading featured books...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-3 bg-blue-100 rounded-full mb-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert
              type="error"
              title="Connection Error"
              message={error}
              dismissible
              onDismiss={() => useHomeStore.setState({ error: null })}
            />
            <div className="text-center mt-4">
              <Button
                variant="primary"
                leftIcon={<RefreshCw size={16} />}
                onClick={handleRetry}
              >
                Retry Loading Books
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of book categories and find your next
              favorite read
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
                green: "bg-green-100 text-green-600 hover:bg-green-200",
                purple: "bg-purple-100 text-purple-600 hover:bg-purple-200",
                pink: "bg-pink-100 text-pink-600 hover:bg-pink-200",
                orange: "bg-orange-100 text-orange-600 hover:bg-orange-200",
                red: "bg-red-100 text-red-600 hover:bg-red-200",
              }[category.color];

              return (
                <Link
                  key={category.name}
                  to={`/catalog?category=${category.name.toLowerCase()}`}
                  className={`${colorClasses} p-6 rounded-xl text-center transition-all hover:scale-105`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm opacity-75 mt-1">
                    {category.count}+ books
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Books
              </h2>
              <p className="text-gray-600">
                Hand-picked selections just for you
              </p>
            </div>
            <Link
              to="/catalog?sort=featured"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight size={20} className="ml-1" />
            </Link>
          </div>

          <BookGrid books={featuredBooks} loading={isLoading} />
        </div>
      </section>

      {/* New Releases */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
                <h2 className="text-3xl font-bold text-gray-900">
                  New Releases
                </h2>
              </div>
              <p className="text-gray-600">
                The latest additions to our collection
              </p>
            </div>
            <Link
              to="/catalog?sort=newest"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight size={20} className="ml-1" />
            </Link>
          </div>

          <BookGrid books={newReleases} loading={isLoading} />
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Bestsellers
                </h2>
              </div>
              <p className="text-gray-600">The most popular books this week</p>
            </div>
            <Link
              to="/catalog?sort=popularity"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight size={20} className="ml-1" />
            </Link>
          </div>

          <BookGrid books={bestsellers} loading={isLoading} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Readers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy readers who have found their next favorite
              book with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center p-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <Rating
                  value={testimonial.rating}
                  size="md"
                  className="justify-center mb-3"
                />
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <h4 className="font-semibold text-gray-900">
                  {testimonial.name}
                </h4>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-blue-100 mb-8">
            Get exclusive deals, new releases, and reading recommendations
            delivered to your inbox
          </p>

          <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 text-gray-900 rounded-lg focus:ring-4 focus:ring-yellow-300"
            />
            <Button variant="secondary" size="lg">
              Subscribe
            </Button>
          </form>

          <p className="text-sm text-blue-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
