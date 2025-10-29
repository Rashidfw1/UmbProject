// Fix: Removed self-import of LocalizedString which conflicted with its local declaration.

export type Language = 'en' | 'ar';

export type Product = {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number; // in OMR
  imageUrl: string;
  category: 'necklaces' | 'rings' | 'bracelets' | 'earrings';
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type LocalizedString = {
  en: string;
  ar: string;
};

export type CurrencyCode = 'OMR' | 'USD' | 'AED' | 'SAR' | 'QAR' | 'BHD' | 'KWD';

export type Currency = {
  code: CurrencyCode;
  name: LocalizedString;
  symbol: LocalizedString;
  decimalPlaces: number;
};

export type UserRole = 'admin' | 'customer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
};

export type OrderStatus = 'Pending' | 'Pending Payment' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Payment Failed';

export type Order = {
  id: string;
  userId?: string;
  customerName: string;
  customerContact: string; // WhatsApp number for guest
  items: CartItem[];
  total: number;
  date: string;
  status: OrderStatus;
  discountAmount?: number;
  couponCode?: string;
  paymentMethod: 'WhatsApp' | 'Thawani';
  isGift: boolean;
  recipientName?: string;
  recipientContact?: string;
  country: string; // e.g., 'oman', 'uae'
  deliveryType?: 'home' | 'office'; // For Oman
  governorate?: string;
  wilayah?: string;
  addressLine1?: string; // For GCC
  addCard: boolean;
  cardMessage?: string;
  additionalNotes?: string;
  deliveryFee?: number;
};


export type Coupon = {
  id: string;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  isActive: boolean;
};

export type HomepageContent = {
  heroImageUrl: string;
  heroTitle: LocalizedString;
  heroSubtitle: LocalizedString;
  shopNowButton: LocalizedString;
  featuredProductsTitle: LocalizedString;
};

export type CoreValue = {
  title: LocalizedString;
  description: LocalizedString;
};

export type AboutUsContent = {
  title: LocalizedString;
  paragraphs: LocalizedString[];
  coreValuesTitle: LocalizedString;
  coreValues: CoreValue[];
};

export type FAQItem = {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
};

export type SocialMediaLinks = {
  instagram: string;
  snapchat: string;
  twitter: string;
};