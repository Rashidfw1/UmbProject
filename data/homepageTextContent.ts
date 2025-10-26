import { HomepageContent } from '../types';

// Fix: Changed type from non-existent 'HomepageTextContent' to 'Partial<HomepageContent>'.
export const homepageTextContent: Partial<HomepageContent> = {
  heroTitle: { en: 'Elegance in Every Detail', ar: 'الأناقة في كل تفصيلة' },
  heroSubtitle: { en: 'Discover exquisite jewelry that tells your story.', ar: 'اكتشفي مجوهرات رائعة تروي قصتك.' },
  shopNowButton: { en: 'Shop Now', ar: 'تسوق الآن' },
  featuredProductsTitle: { en: 'Featured Products', ar: 'منتجات مميزة' },
};
