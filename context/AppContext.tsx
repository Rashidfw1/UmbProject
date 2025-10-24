import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language, CurrencyCode, Product, CartItem, WishlistItem, User, Order, Coupon, HomepageContent } from '../types';
import { products as initialProducts } from '../data/products';
import { users as initialUsers } from '../data/users';
import { orders as initialOrders } from '../data/orders';
import { coupons as initialCoupons } from '../data/coupons';
import { homepageContent as initialHomepageContent } from '../data/homepageContent';

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  wishlist: WishlistItem[];
  addToWishlist: (product: Product) => void;
  isProductInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  user: User | null;
  login: (email: string, password: string) => { success: boolean, message: string };
  logout: () => void;
  signUp: (name: string, email: string, password: string) => { success: boolean, message: string };
  users: User[];
  addUser: (user: Omit<User, 'id'>) => { success: boolean, message: string };
  updateUser: (user: User) => { success: boolean, message: string };
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string, newPass: string) => { success: boolean, message: string };
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => { success: boolean, message: string };
  updateCoupon: (coupon: Coupon) => { success: boolean, message: string };
  deleteCoupon: (couponId: string) => void;
  homepageContent: HomepageContent;
  updateHomepageContent: (content: HomepageContent) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('OMR');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(initialHomepageContent);


  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };
  
  useEffect(() => {
    // Set initial language direction
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Cart Logic
  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
  }

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Wishlist Logic
  const isProductInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };
  
  const addToWishlist = (product: Product) => {
    setWishlist(prevWishlist => {
      if (isProductInWishlist(product.id)) {
        return prevWishlist.filter(item => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const wishlistCount = wishlist.length;

  // Auth Logic
  const login = (email: string, password: string): { success: boolean, message: string } => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser && foundUser.password === password) {
        if (foundUser.status !== 'active') {
             return { success: false, message: 'accountNotActive' };
        }
      setUser(foundUser);
      return { success: true, message: 'loginSuccess' };
    }
    return { success: false, message: 'invalidCredentials' };
  };

  const logout = () => {
    setUser(null);
  };

  const signUp = (name: string, email: string, password: string): { success: boolean, message: string } => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'emailExists' };
    }
    const newUser: User = {
        id: String(Date.now()),
        name,
        email,
        password,
        role: 'customer',
        status: 'active'
    };
    setUsers([...users, newUser]);
    return { success: true, message: 'signUpSuccess' };
  }
  
  // Admin User Management
  const addUser = (userData: Omit<User, 'id'>): { success: boolean, message: string } => {
      if(users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
          return { success: false, message: 'emailExists' };
      }
      const newUser: User = { ...userData, id: String(Date.now()) };
      setUsers([...users, newUser]);
      return { success: true, message: '' };
  };
  
  const updateUser = (userData: User): { success: boolean, message: string } => {
      if(users.some(u => u.id !== userData.id && u.email.toLowerCase() === userData.email.toLowerCase())) {
          return { success: false, message: 'emailExists' };
      }
      setUsers(users.map(u => u.id === userData.id ? { ...u, ...userData, password: u.password } : u));
      return { success: true, message: '' };
  };
  
  const deleteUser = (userId: string) => {
      setUsers(users.filter(u => u.id !== userId));
  };
  
  const resetUserPassword = (userId: string, newPass: string): { success: boolean, message: string } => {
      setUsers(users.map(u => u.id === userId ? { ...u, password: newPass } : u));
      return { success: true, message: 'passwordResetSuccessfully' };
  }
  
  // Admin Coupon Management
  const addCoupon = (couponData: Omit<Coupon, 'id'>): { success: boolean, message: string } => {
      if(coupons.some(c => c.code.toUpperCase() === couponData.code.toUpperCase())) {
          return { success: false, message: 'couponCodeExists' };
      }
      const newCoupon: Coupon = { ...couponData, code: couponData.code.toUpperCase(), id: String(Date.now()) };
      setCoupons([...coupons, newCoupon]);
      return { success: true, message: '' };
  };

  const updateCoupon = (couponData: Coupon): { success: boolean, message: string } => {
       if(coupons.some(c => c.id !== couponData.id && c.code.toUpperCase() === couponData.code.toUpperCase())) {
          return { success: false, message: 'couponCodeExists' };
      }
      setCoupons(coupons.map(c => c.id === couponData.id ? { ...couponData, code: couponData.code.toUpperCase() } : c));
      return { success: true, message: '' };
  };

  const deleteCoupon = (couponId: string) => {
      setCoupons(coupons.filter(c => c.id !== couponId));
  };
  
  // Admin Homepage Management
  const updateHomepageContent = (content: HomepageContent) => {
    setHomepageContent(content);
  }

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      currency, setCurrency,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartCount, cartTotal,
      wishlist, addToWishlist, isProductInWishlist, wishlistCount,
      user, login, logout, signUp,
      users, addUser, updateUser, deleteUser, resetUserPassword,
      products, setProducts,
      orders, setOrders,
      coupons, addCoupon, updateCoupon, deleteCoupon,
      homepageContent, updateHomepageContent,
    }}>
      {children}
    </AppContext.Provider>
  );
};
