
export type Language = 'en' | 'ar';

export type LocalizedString = {
  [key in Language]: string;
};

export interface Product {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number; // in OMR
  imageUrl: string;
  category: string;
}

export type CurrencyCode = 'OMR' | 'USD' | 'AED' | 'SAR' | 'QAR' | 'BHD' | 'KWD';

export interface Currency {
  code: CurrencyCode;
  name: LocalizedString;
  symbol: LocalizedString;
  decimalPlaces: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type WishlistItem = Product;

export type UserRole = 'admin' | 'customer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
}

export interface OrderItem {
    productId: string;
    productName: LocalizedString;
    quantity: number;
    price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    userId: string;
    userName: string;
    date: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
}

export interface Coupon {
    id: string;
    code: string;
    discountPercentage: number;
    expiryDate: string;
    isActive: boolean;
}

export interface HomepageContent {
    heroImageUrl: string;
}
