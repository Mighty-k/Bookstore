// Book related types
export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  isbn?: string;
  oclc?: string;
  lccn?: string;
  categories?: string[];
  price: number;
  originalPrice?: number;
  coverImage: string;
  rating: number;
  reviews: Review[];
  stock: number;
  publishedDate?: string;
  pageCount?: number;
  publisher?: string;
  language?: string;
  format?: "hardcover" | "paperback" | "ebook" | "audiobook";
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  helpful?: number;
  verified?: boolean;
}

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
  shippingAddress?: Address;
  billingAddress?: Address;
  createdAt?: string;
  wishlist?: string[];
  twoFactorEnabled?: boolean;
}

export interface Address {
  id?: string;
  fullName: string;
  email?: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  type?: "home" | "work" | "other";
}

// Cart related types - Make sure these are exported
export interface CartItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  coverImage: string;
  stock: number;
  maxQuantity?: number;
  addedAt?: string;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  discount?: number;
  itemsCount?: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: string | null;
}

// Order related types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  discount?: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Filter and Search types
export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
  sortBy: "price_asc" | "price_desc" | "rating" | "newest" | "popularity";
  availability?: "all" | "inStock" | "outOfStock";
  format?: string[];
  language?: string[];
}

export interface SearchParams {
  query: string;
  filters: FilterOptions;
  page: number;
  limit: number;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

// Payment types
export interface PaymentMethod {
  id: string;
  type: "card" | "bank_transfer" | "paypal";
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

// Review types
export interface CreateReviewDto {
  bookId: string;
  rating: number;
  comment: string;
  title?: string;
  anonymous?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Wishlist types
export interface WishlistItem {
  bookId: string;
  addedAt: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
}

// Promotion types
export interface Promotion {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  applicableCategories?: string[];
  applicableBooks?: string[];
  usageLimit?: number;
  usageCount: number;
}

// Session types
export interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}
