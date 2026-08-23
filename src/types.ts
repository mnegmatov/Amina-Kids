export type Gender = 'girl' | 'boy' | 'unisex' | 'baby';
export type AgeGroup = '0-2' | '2-5' | '6-10';
export type ProductCategory = 'girls' | 'boys' | 'babies' | 'accessories';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isHit?: boolean;
  discount?: number; // e.g. 15 for 15%
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  description: string;
  composition: string; // e.g. "100% Органический хлопок"
  care: string; // e.g. "Машинная стирка 30°C, деликатный режим"
  gender: Gender;
  ageGroup: AgeGroup;
  reviews?: ProductReview[];
  inStock: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + color + size)
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
}

export interface FilterState {
  category: ProductCategory | 'all';
  subcategory: string | 'all';
  gender: Gender | 'all';
  ageGroup: AgeGroup | 'all';
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  onlyDiscount: boolean;
  searchQuery: string;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'discount';
}

export type PageType =
  | 'home'
  | 'catalog'
  | 'product'
  | 'checkout'
  | 'about'
  | 'shipping'
  | 'contacts'
  | 'wishlist';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info';
}

export interface OrderDetails {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  deliveryMethod: 'courier' | 'pickup' | 'showroom';
  address: string;
  paymentMethod: 'card' | 'cash';
  comment?: string;
  promoCode?: string;
}
