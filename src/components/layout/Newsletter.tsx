import React, { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubscribed(true);
    setEmail("");
    setIsLoading(false);
    toast.success("Successfully subscribed to newsletter!");
  };

  if (isSubscribed) {
    return (
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Thank You for Subscribing!
            </h3>
            <p className="text-blue-100 mb-6">
              You'll receive our best deals and new arrivals in your inbox.
            </p>
            <button
              onClick={() => setIsSubscribed(false)}
              className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <Mail className="w-6 h-6 mr-2" />
              <h3 className="text-2xl font-bold">Stay Updated</h3>
            </div>
            <p className="text-blue-100 max-w-md">
              Subscribe to our newsletter for exclusive deals, new releases, and
              reading recommendations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full sm:w-80 px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg 
                           text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled={isLoading}
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-200" />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold 
                         hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-blue-200 mt-3 text-center lg:text-left">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
