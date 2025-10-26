
import { supabase } from './supabaseClient';
import {
  Product,
  User,
  Order,
  Coupon,
  OrderStatus,
} from '../types';

// Import default data for initial settings creation
import { siteSettings as defaultSiteSettingsData } from '../data/siteSettings';
import { homepageContent as defaultHomepageContentData } from '../data/homepageContent';
import { homepageTextContent as defaultHomepageTextData } from '../data/homepageTextContent';
import { aboutUsContent as defaultAboutUsData } from '../data/aboutUsContent';
import { faqContent as defaultFaqData } from '../data/faqContent';


// --- Data Mapping Helpers (with validation) ---

const productFromDb = (dbProduct: any): Product | null => {
  if (!dbProduct || !dbProduct.id || !dbProduct.name_localized || !dbProduct.description_localized) {
    console.warn('Skipping malformed product from DB:', dbProduct);
    return null;
  }
  return {
    id: dbProduct.id,
    name: dbProduct.name_localized,
    description: dbProduct.description_localized,
    price: dbProduct.price,
    imageUrl: dbProduct.image_url,
    category: dbProduct.category,
  };
};

const productToDb = (product: Omit<Product, 'id'>) => ({
  name_localized: product.name,
  description_localized: product.description,
  price: product.price,
  image_url: product.imageUrl,
  category: product.category,
});

const userFromDb = (dbProfile: any): User | null => {
    if(!dbProfile || !dbProfile.id || !dbProfile.full_name || !dbProfile.role) {
        console.warn('Skipping malformed user profile from DB:', dbProfile);
        return null;
    }
    return {
        id: dbProfile.id,
        name: dbProfile.full_name,
        email: 'managed-by-supabase@auth.com', // Email is sensitive, not exposed here
        role: dbProfile.role,
        status: 'active'
    };
};

const orderFromDb = (dbOrder: any): Order | null => {
  if (!dbOrder || !dbOrder.id || !dbOrder.order_details) {
    console.warn('Skipping malformed order from DB:', dbOrder);
    return null;
  }
  return {
    ...dbOrder.order_details,
    id: dbOrder.id,
    userId: dbOrder.user_id,
    total: dbOrder.total_price,
    date: dbOrder.created_at,
    status: dbOrder.order_status,
    paymentMethod: dbOrder.payment_method,
  };
};

const couponFromDb = (dbCoupon: any): Coupon | null => {
    if (!dbCoupon || !dbCoupon.id || !dbCoupon.code) {
        console.warn('Skipping malformed coupon from DB:', dbCoupon);
        return null;
    }
    return {
        id: dbCoupon.id,
        code: dbCoupon.code,
        discountPercentage: dbCoupon.discount_percentage,
        expiryDate: dbCoupon.expiry_date,
        isActive: dbCoupon.is_active
    };
}


// --- File Upload Helper ---
const uploadFileFromBase64 = async (base64: string, bucket: string): Promise<string> => {
    if (!base64.startsWith('data:')) return base64; // It's already a URL

    const [header, data] = base64.split(',');
    if (!header || !data) {
        throw new Error('Invalid Base64 string format for file upload.');
    }
    const mime = header.match(/:(.*?);/)?.[1];
    const ext = mime?.split('/')[1];
    const fileName = `${Date.now()}.${ext || 'png'}`;
    
    const res = await fetch(base64);
    const blob = await res.blob();
    
    const { data: uploadData, error } = await supabase.storage.from(bucket).upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
        if (error.message.includes('Bucket not found')) {
            throw new Error(`Upload failed: The storage bucket named "${bucket}" was not found. Please create it in your Supabase project dashboard and ensure it's public.`);
        }
        if (error.message.includes('security policy')) {
            throw new Error(`Upload failed due to a security policy. Please ensure authenticated users have permission to upload to the "${bucket}" storage bucket by adding a policy in the Supabase SQL Editor.`);
        }
        throw new Error(`Error uploading to ${bucket}: ${error.message}`);
    }

    if (!uploadData) {
        throw new Error(`Upload to ${bucket} completed without returning data.`);
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    if (!publicUrl) {
        throw new Error(`Failed to get public URL for uploaded file in ${bucket}.`);
    }
    return publicUrl;
};


// --- API Functions ---

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching products:', error.message);
      return [];
    }
    if (!data) return [];
    return data.map(productFromDb).filter((p): p is Product => p !== null);
  } catch(e: any) {
    console.error('Exception in getProducts:', e.message);
    return [];
  }
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const imageUrl = await uploadFileFromBase64(productData.imageUrl, 'products');

    const { data, error } = await supabase
        .from('products')
        .insert([{ ...productToDb({ ...productData, imageUrl }) }])
        .select()
        .single();
    
    if (error || !data) {
        throw new Error(error?.message || 'Failed to add product to the database.');
    }
    const mappedProduct = productFromDb(data);
    if (!mappedProduct) throw new Error('Failed to map product from DB response.');
    return mappedProduct;
};

export const updateProduct = async (productData: Product): Promise<Product> => {
    const imageUrl = await uploadFileFromBase64(productData.imageUrl, 'products');

    const { data, error } = await supabase
        .from('products')
        .update(productToDb({ ...productData, imageUrl }))
        .eq('id', productData.id)
        .select()
        .single();

    if (error || !data) {
        throw new Error(error?.message || 'Failed to update product in the database.');
    }
    const mappedProduct = productFromDb(data);
    if (!mappedProduct) throw new Error('Failed to map product from DB response after update.');
    return mappedProduct;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) console.error('Error deleting product:', error.message);
};


// Users & Auth
export const onAuthStateChange = (callback: (event: string, session: any | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getUserProfile = async (): Promise<User | null> => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const maxRetries = 10;
  const retryInterval = 1000; 

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error(`Error fetching profile (attempt ${attempt}):`, error.message);
          break;
      }

      if (profile) {
          return {
              id: authUser.id,
              name: profile.full_name,
              email: authUser.email!,
              role: profile.role,
              status: 'active',
          };
      }
      
      if (attempt < maxRetries) {
          await wait(retryInterval);
      }
  }

  console.error("Failed to fetch user profile after multiple retries. Falling back to a default 'customer' profile.");
  return {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
    email: authUser.email!,
    role: 'customer',
    status: 'active',
  };
};

export const login = async (email: string, pass: string): Promise<{ success: boolean; message: string; }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Login successful' };
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
};

export const signUp = async (name: string, email: string, pass: string): Promise<{ success: boolean; message: string; }> => {
    const { data: authData, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } }
    });

    if (error) return { success: false, message: error.message };
    if (!authData.user) return { success: false, message: 'Signup succeeded but no user object was returned.' };

    const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: name,
        role: 'customer'
    });

    if (profileError) {
        console.error('CRITICAL: Failed to create profile for new user:', profileError.message);
        let message = `Account created, but failed to save profile: ${profileError.message}`;
        if (profileError.message.includes('security policy')) {
            message = 'Your account was created, but a database security policy prevented saving your profile. Please contact support.';
        }
        return { success: false, message };
    }
    
    return { success: true, message: 'Account created successfully! Logging you in...' };
};

export const getUsers = async (): Promise<User[]> => {
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error.message);
            return [];
        }
        if (!data) return [];
        return data.map(userFromDb).filter((u): u is User => u !== null);
    } catch (e: any) {
        console.error('Exception in getUsers:', e.message);
        return [];
    }
};

export const addUser = async (userData: Omit<User, 'id'>): Promise<{ success: boolean, message: string, user?: User }> => {
    const { data: authData, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password!,
        options: { data: { full_name: userData.name } }
    });

    if(error || !authData.user) {
        return { success: false, message: error?.message || "Failed to create auth user." };
    }

    const { data, error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: userData.name,
        role: userData.role
    }).select().single();

    if(profileError) {
        if (profileError.message.includes('security policy')) {
             return { success: false, message: `Database error: A security policy is preventing user profile creation. Please ensure you have an RLS policy on the 'profiles' table that allows inserts.` };
        }
        return { success: false, message: profileError.message };
    }
    
    const mappedUser = userFromDb(data);
    if (!mappedUser) return { success: false, message: "Failed to create user: could not map DB response." };
    
    return { success: true, message: 'User added', user: { ...mappedUser, email: userData.email }};
};

export const updateUser = async (userData: User): Promise<{ success: boolean, message: string, user?: User }> => {
    const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: userData.name, role: userData.role })
        .eq('id', userData.id)
        .select()
        .single();
    
    if (error) return { success: false, message: error.message };

    const mappedUser = userFromDb(data);
    if (!mappedUser) return { success: false, message: "Failed to update user: could not map DB response." };

    return { success: true, message: 'User updated', user: { ...mappedUser, email: userData.email } };
};

export const deleteUser = async (userId: string): Promise<void> => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) console.error('Error deleting user profile:', error.message);
};


// Orders
export const getOrders = async (): Promise<Order[]> => {
    try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching orders:', error.message);
            return [];
        }
        if (!data) return [];
        return data.map(orderFromDb).filter((o): o is Order => o !== null);
    } catch(e: any) {
        console.error('Exception in getOrders:', e.message);
        return [];
    }
};

export const addOrder = async (orderData: Omit<Order, 'id'>): Promise<Order | null> => {
    const { items, ...details } = orderData;
    const dbOrder = {
      user_id: orderData.userId,
      order_details: details,
      total_price: orderData.total,
      payment_method: orderData.paymentMethod,
      order_status: orderData.status,
    };
    
    const { data, error } = await supabase.from('orders').insert(dbOrder).select().single();
    if (error) {
        console.error('Error adding order:', error.message);
        return null;
    }
    const mappedOrder = orderFromDb(data);
    if (!mappedOrder) return null;
    
    // items are not stored in a separate column but are part of order_details on frontend.
    return { ...mappedOrder, items };
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    if(error) console.error("Error updating order status:", error.message);
    return !error;
};


// Coupons
export const getCoupons = async (): Promise<Coupon[]> => {
    try {
        const { data, error } = await supabase.from('coupons').select('*');
        if (error) {
            console.error('Error fetching coupons:', error.message);
            return [];
        }
        if (!data) return [];
        return data.map(couponFromDb).filter((c): c is Coupon => c !== null);
    } catch (e: any) {
        console.error('Exception in getCoupons:', e.message);
        return [];
    }
};

export const addCoupon = async (couponData: Omit<Coupon, 'id'>): Promise<{ success: boolean, message: string, coupon?: Coupon }> => {
    const { data, error } = await supabase.from('coupons').insert({
        code: couponData.code.toUpperCase(),
        discount_percentage: couponData.discountPercentage,
        expiry_date: couponData.expiryDate,
        is_active: couponData.isActive
    }).select().single();
    
    if (error) return { success: false, message: error.message };
    const mappedCoupon = couponFromDb(data);
    if (!mappedCoupon) return { success: false, message: "Could not map coupon from DB response." };
    return { success: true, message: 'Coupon added', coupon: mappedCoupon };
};

export const updateCoupon = async (couponData: Coupon): Promise<{ success: boolean, message: string, coupon?: Coupon }> => {
    const { data, error } = await supabase.from('coupons').update({
        code: couponData.code.toUpperCase(),
        discount_percentage: couponData.discountPercentage,
        expiry_date: couponData.expiryDate,
        is_active: couponData.isActive
    }).eq('id', couponData.id).select().single();

    if (error) return { success: false, message: error.message };
    const mappedCoupon = couponFromDb(data);
    if (!mappedCoupon) return { success: false, message: "Could not map coupon from DB response." };
    return { success: true, message: 'Coupon updated', coupon: mappedCoupon };
};

export const deleteCoupon = async (couponId: string): Promise<void> => {
    await supabase.from('coupons').delete().eq('id', couponId);
};

// Site Content and Settings
let SETTINGS_ID: number | null = null;

const defaultSettingsPayload = {
    logo_url: defaultSiteSettingsData.defaultLogoUrl,
    social_media_links: defaultSiteSettingsData.defaultSocialMediaLinks,
    homepage_content: {
        ...defaultHomepageContentData,
        ...defaultHomepageTextData
    },
    about_us_content: defaultAboutUsData,
    faq_content: defaultFaqData,
};

// Helper function to robustly merge database settings with local defaults
const mergeSettingsWithDefaults = (dbSettings: any | null): any => {
    const defaults = defaultSettingsPayload;

    if (!dbSettings) {
        return defaults;
    }

    // Return a new object, ensuring every key from the default structure is present and valid.
    // This prevents the app from crashing if a nested object is null in the database.
    return {
        id: dbSettings.id, // Keep ID from DB
        created_at: dbSettings.created_at, // Keep created_at from DB
        logo_url: dbSettings.logo_url || defaults.logo_url,
        social_media_links: { ...defaults.social_media_links, ...(dbSettings.social_media_links || {}) },
        homepage_content: { ...defaults.homepage_content, ...(dbSettings.homepage_content || {}) },
        about_us_content: { ...defaults.about_us_content, ...(dbSettings.about_us_content || {}) },
        faq_content: Array.isArray(dbSettings.faq_content) ? dbSettings.faq_content : defaults.faq_content,
    };
};

export const getSiteSettings = async (): Promise<any> => {
    try {
        const { data: existingSettings, error } = await supabase
            .from('site_settings')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error.
            console.error("Critical error fetching site settings:", error.message);
            SETTINGS_ID = null;
            return defaultSettingsPayload; // Fallback on critical error
        }
        
        SETTINGS_ID = existingSettings?.id || null;
        // Always return a merged, complete settings object to prevent inconsistent state.
        return mergeSettingsWithDefaults(existingSettings);

    } catch (e: any) {
        console.error("An unexpected exception occurred while fetching site settings:", e.message);
        SETTINGS_ID = null;
        return defaultSettingsPayload; // Fallback on exception
    }
};

export const updateSiteSettings = async (update: any): Promise<any> => {
    if (update.logo_url) {
        update.logo_url = await uploadFileFromBase64(update.logo_url, 'settings');
    }
    if (update.homepage_content?.heroImageUrl) {
        update.homepage_content.heroImageUrl = await uploadFileFromBase64(update.homepage_content.heroImageUrl, 'settings');
    }

    let updatedData, dbError;

    if (SETTINGS_ID !== null) {
        const { data, error } = await supabase
            .from('site_settings')
            .update(update)
            .eq('id', SETTINGS_ID)
            .select()
            .single();
        updatedData = data;
        dbError = error;
    } else {
        // If no settings exist, merge the update with the full default payload before inserting.
        const newRecord = { ...defaultSettingsPayload, ...update };
        const { data, error } = await supabase
            .from('site_settings')
            .insert(newRecord)
            .select()
            .single();
        
        updatedData = data;
        dbError = error;

        if (updatedData) {
            SETTINGS_ID = updatedData.id;
        }
    }

    if (dbError) {
        console.error("Error saving site settings:", dbError.message);
        alert(`Failed to save settings: ${dbError.message}`);
        return null;
    }

    // Always return a merged, complete settings object to the context to prevent crashes.
    return mergeSettingsWithDefaults(updatedData);
};
