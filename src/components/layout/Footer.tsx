import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Truck,
  Heart,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-white">BookHaven</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Your premier destination for books across all genres. Discover
              your next great read with us.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-sm hover:text-white transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-sm hover:text-white transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop by Category</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/catalog?category=fiction"
                  className="text-sm hover:text-white transition-colors"
                >
                  Fiction
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?category=non-fiction"
                  className="text-sm hover:text-white transition-colors"
                >
                  Non-Fiction
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?category=technology"
                  className="text-sm hover:text-white transition-colors"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?category=children"
                  className="text-sm hover:text-white transition-colors"
                >
                  Children's Books
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?category=academic"
                  className="text-sm hover:text-white transition-colors"
                >
                  Academic
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">
                  123 Book Street, Literary District
                  <br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">support@bookhaven.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Truck className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Free Shipping</p>
              <p className="text-xs text-gray-400">On orders over $25</p>
            </div>
            <div className="text-center">
              <Lock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Secure Payment</p>
              <p className="text-xs text-gray-400">256-bit encryption</p>
            </div>
            <div className="text-center">
              <CreditCard className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Easy Returns</p>
              <p className="text-xs text-gray-400">30-day return policy</p>
            </div>
            <div className="text-center">
              <Heart className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">24/7 Support</p>
              <p className="text-xs text-gray-400">We're here to help</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear} BookHaven. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
