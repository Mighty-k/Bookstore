import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import Newsletter from "./Newsletter";
import Breadcrumbs from "./Breadcrumbs";
import MobileNav from "./MobileNav";
import QuickViewModal from "../books/QuickViewModal";
import { useUIStore } from "../../store/uiStore";

const Layout: React.FC = () => {
  const { isQuickViewOpen, closeQuickView, quickViewBook } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />

      {/* Header */}
      <Header />

      {/* Breadcrumbs (except on homepage) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
        <Breadcrumbs />
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Newsletter Signup */}
      <Newsletter />

      {/* Footer */}
      <Footer />

      {/* Mobile Navigation (visible on mobile) */}
      <MobileNav />

      {/* Quick View Modal - Global */}
      {isQuickViewOpen && quickViewBook && (
        <QuickViewModal
          book={quickViewBook}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
        />
      )}
    </div>
  );
};

export default Layout;
