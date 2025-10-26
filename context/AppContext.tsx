import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Product, CartItem, Language, CurrencyCode, User, Order, Coupon, HomepageContent, UserRole, UserStatus, OrderStatus, AboutUsContent, FAQItem, SocialMediaLinks } from '../types';
import * as api from '../services/api';
// Import default data for fallback
import { siteSettings as defaultSiteSettingsData } from '../data/siteSettings';
import { homepageContent as defaultHomepageContentData } from '../data/homepageContent';
import { homepageTextContent as defaultHomepageTextData } from '../data/homepageTextContent';
import { aboutUsContent as defaultAboutUsData } from '../data/aboutUsContent';
import { faqContent as defaultFaqData } from '../data/faqContent';

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (product: Product) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  isProductInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string; }>;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<{ success: boolean, message: string }>;
  updateUser: (user: User) => Promise<{ success: boolean, message: string }>;
  deleteUser: (userId: string) => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<{ success: boolean, message: string }>;
  updateCoupon: (coupon: Coupon) => Promise<{ success: boolean, message: string }>;
  deleteCoupon: (couponId: string) => Promise<void>;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean, message: string };
  removeCoupon: () => void;
  homepageContent: HomepageContent | null;
  updateHomepageContent: (content: HomepageContent) => Promise<void>;
  logoUrl: string | null;
  updateLogoUrl: (newUrl: string) => Promise<void>;
  aboutUsContent: AboutUsContent | null;
  updateAboutUsContent: (content: AboutUsContent) => Promise<void>;
  faqContent: FAQItem[] | null;
  updateFaqContent: (content: FAQItem[]) => Promise<void>;
  socialMediaLinks: SocialMediaLinks | null;
  updateSocialMediaLinks: (links: SocialMediaLinks) => Promise<void>;
  isLoading: boolean;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');
  const [currency, setCurrency] = useState<CurrencyCode>(() => (localStorage.getItem('currency') as CurrencyCode) || 'OMR');
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [wishlist, setWishlist] = useState<Product[]>(() => JSON.parse(localStorage.getItem('wishlist') || '[]'));
  const [user, setUser] = useState<User | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => JSON.parse(localStorage.getItem('appliedCoupon') || 'null'));
  
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    // Subscribe to auth changes
    const { data: authListener } = api.onAuthStateChange(async (_event, session) => {
      if (session) {
        const userProfile = await api.getUserProfile();
        setUser(userProfile);
      } else {
        setUser(null);
      }
    });

    // Fetch all initial data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          api.getProducts(),
          api.getUsers(),
          api.getOrders(),
          api.getCoupons(),
          api.getSiteSettings()
        ]);

        const [productsResult, usersResult, ordersResult, couponsResult, siteSettingsResult] = results;

        if (productsResult.status === 'fulfilled') {
          setProducts(productsResult.value);
        } else {
          console.error("Failed to fetch products:", productsResult.reason);
        }

        if (usersResult.status === 'fulfilled') {
          setUsers(usersResult.value);
        } else {
          console.error("Failed to fetch users:", usersResult.reason);
        }
        
        if (ordersResult.status === 'fulfilled') {
          setOrders(ordersResult.value);
        } else {
          console.error("Failed to fetch orders:", ordersResult.reason);
        }
        
        if (couponsResult.status === 'fulfilled') {
          setCoupons(couponsResult.value);
        } else {
          console.error("Failed to fetch coupons:", couponsResult.reason);
          setCoupons([]); // Set to empty array on failure
        }

        if (siteSettingsResult.status === 'fulfilled') {
          setSiteSettings(siteSettingsResult.value);
        } else {
           console.error("CRITICAL: Failed to fetch site settings, falling back to local defaults.", siteSettingsResult.reason);
           // Fallback to locally imported default settings to prevent app from crashing/hanging
           const defaultSettings = {
              logo_url: defaultSiteSettingsData.defaultLogoUrl,
              social_media_links: defaultSiteSettingsData.defaultSocialMediaLinks,
              homepage_content: {
                ...defaultHomepageContentData,
                ...defaultHomepageTextData
              },
              about_us_content: defaultAboutUsData,
              faq_content: defaultFaqData,
           };
           setSiteSettings(defaultSettings);
        }

      } catch (error) {
          console.error("A critical error occurred during the data fetching process:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Persist user preferences and cart to Local Storage
  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  useEffect(() => { localStorage.setItem('currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon)); }, [appliedCoupon]);
  
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
  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.product.id !== productId));
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) removeFromCart(productId);
    else setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };
  const clearCart = () => setCart([]);
  const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);

  // Wishlist Logic
  const isProductInWishlist = (productId: string) => wishlist.some(p => p.id === productId);
  const addToWishlist = (product: Product) => {
    setWishlist(prev => isProductInWishlist(product.id) ? prev.filter(p => p.id !== product.id) : [...prev, product]);
  };
  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  // Auth Logic
  const login = async (email: string, pass: string) => await api.login(email, pass);
  const logout = async () => await api.logout();
  const signUp = async (name: string, email: string, pass: string) => await api.signUp(name, email, pass);
  
  // Product Management
  const addProduct = async (productData: Omit<Product, 'id'>) => {
      const newProduct = await api.addProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
  };
  const updateProduct = async (productData: Product) => {
      const updatedProduct = await api.updateProduct(productData);
      setProducts(prev => prev.map(p => p.id === productData.id ? updatedProduct : p));
      return updatedProduct;
  };
  const deleteProduct = async (productId: string) => {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // User Management
  const addUser = async (userData: Omit<User, 'id'>) => {
    const result = await api.addUser(userData);
    if(result.success && result.user) setUsers(prev => [...prev, result.user!]);
    return result;
  };
  const updateUser = async (userData: User) => {
    const result = await api.updateUser(userData);
    if(result.success && result.user) setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...result.user } : u));
    return result;
  };
  const deleteUser = async (userId: string) => {
    await api.deleteUser(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Order Management
  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    const newOrder = await api.addOrder(orderData);
    if(newOrder) setOrders(prev => [newOrder, ...prev]);
    if (orderData.status !== 'Pending Payment') {
      clearCart();
      removeCoupon();
    }
    return newOrder;
  };
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const success = await api.updateOrderStatus(orderId, status);
    if(success) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };
  
  // Coupon Management
  const addCoupon = async (couponData: Omit<Coupon, 'id'>) => {
      const result = await api.addCoupon(couponData);
      if(result.success && result.coupon) setCoupons(prev => [result.coupon!, ...prev]);
      return result;
  };
  const updateCoupon = async (couponData: Coupon) => {
      const result = await api.updateCoupon(couponData);
      if(result.success && result.coupon) setCoupons(prev => prev.map(c => c.id === couponData.id ? result.coupon! : c));
      return result;
  };
  const deleteCoupon = async (couponId: string) => {
      await api.deleteCoupon(couponId);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
  };
  const applyCoupon = (code: string) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    const today = new Date().toISOString().split('T')[0];
    if (coupon && coupon.isActive && coupon.expiryDate >= today) {
        setAppliedCoupon(coupon);
        return { success: true, message: 'couponApplied' };
    }
    return { success: false, message: 'invalidCoupon' };
  };
  const removeCoupon = () => setAppliedCoupon(null);

  // Site Content and Settings Management
  const updateHomepageContent = async (content: HomepageContent) => {
    const newSettings = await api.updateSiteSettings({ homepage_content: content });
    if (newSettings) setSiteSettings(newSettings);
  };
  const updateLogoUrl = async (newUrl: string) => {
    const newSettings = await api.updateSiteSettings({ logo_url: newUrl });
    if (newSettings) setSiteSettings(newSettings);
  };
  const updateAboutUsContent = async (content: AboutUsContent) => {
    const newSettings = await api.updateSiteSettings({ about_us_content: content });
    if (newSettings) setSiteSettings(newSettings);
  };
  const updateFaqContent = async (content: FAQItem[]) => {
    const newSettings = await api.updateSiteSettings({ faq_content: content });
    if (newSettings) setSiteSettings(newSettings);
  };
  const updateSocialMediaLinks = async (links: SocialMediaLinks) => {
    const newSettings = await api.updateSiteSettings({ social_media_links: links });
    if (newSettings) setSiteSettings(newSettings);
  };

  const value: AppContextType = {
    language, setLanguage,
    currency, setCurrency,
    products, addProduct, updateProduct, deleteProduct,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartCount, cartSubtotal,
    wishlist, addToWishlist, isProductInWishlist, wishlistCount,
    user, login, logout, signUp, 
    users, addUser, updateUser, deleteUser,
    orders, addOrder, updateOrderStatus,
    coupons, addCoupon, updateCoupon, deleteCoupon,
    appliedCoupon, applyCoupon, removeCoupon,
    homepageContent: siteSettings?.homepage_content,
    updateHomepageContent,
    logoUrl: siteSettings?.logo_url, updateLogoUrl,
    aboutUsContent: siteSettings?.about_us_content, updateAboutUsContent,
    faqContent: siteSettings?.faq_content, updateFaqContent,
    socialMediaLinks: siteSettings?.social_media_links, updateSocialMediaLinks,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};