
import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: { en: 'Serene Diamond Necklace', ar: 'قلادة الألماس الهادئة' },
    description: { 
      en: 'A breathtaking diamond necklace that exudes elegance and serenity. Perfect for special occasions.', 
      ar: 'قلادة ألماس تخطف الأنفاس تشع بالأناقة والسكينة. مثالية للمناسبات الخاصة.' 
    },
    price: 481.250,
    imageUrl: 'https://picsum.photos/id/1071/400/400',
    category: 'necklaces',
  },
  {
    id: '2',
    name: { en: 'Golden Solitaire Ring', ar: 'خاتم سوليتير ذهبي' },
    description: { 
      en: 'Classic and timeless, this golden solitaire ring is a symbol of eternal love.', 
      ar: 'كلاسيكي وخالد، هذا الخاتم السوليتير الذهبي هو رمز للحب الأبدي.' 
    },
    price: 327.250,
    imageUrl: 'https://picsum.photos/id/211/400/400',
    category: 'rings',
  },
  {
    id: '3',
    name: { en: 'Azure Charm Bracelet', ar: 'سوار السحر اللازوردي' },
    description: { 
      en: 'Adorn your wrist with this beautiful charm bracelet featuring azure stones.', 
      ar: 'زين معصمك بهذا السوار الساحر الجميل الذي يتميز بأحجار لازوردية.' 
    },
    price: 161.700,
    imageUrl: 'https://picsum.photos/id/1029/400/400',
    category: 'bracelets',
  },
  {
    id: '4',
    name: { en: 'Emerald Drop Earrings', ar: 'أقراط الزمرد المتدلية' },
    description: { 
      en: 'Stunning drop earrings with vibrant emeralds, designed to make a statement.', 
      ar: 'أقراط متدلية مذهلة بزمرد نابض بالحياة، مصممة لتترك انطباعاً.' 
    },
    price: 377.300,
    imageUrl: 'https://picsum.photos/id/1072/400/400',
    category: 'earrings',
  },
    {
    id: '5',
    name: { en: 'Pearl Strand Necklace', ar: 'قلادة خيط اللؤلؤ' },
    description: {
      en: 'An elegant single strand of freshwater pearls. A must-have for any jewelry collection.',
      ar: 'خيط واحد أنيق من لآلئ المياه العذبة. قطعة لا غنى عنها في أي مجموعة مجوهرات.',
    },
    price: 250.250,
    imageUrl: 'https://picsum.photos/id/1080/400/400',
    category: 'necklaces',
  },
  {
    id: '6',
    name: { en: 'Rose Gold Band', ar: 'خاتم من الذهب الوردي' },
    description: {
      en: 'A simple yet chic rose gold band that can be worn alone or stacked.',
      ar: 'خاتم بسيط وأنيق من الذهب الوردي يمكن ارتداؤه بمفرده أو مع خواتم أخرى.',
    },
    price: 115.500,
    imageUrl: 'https://picsum.photos/id/305/400/400',
    category: 'rings',
  },
  {
    id: '7',
    name: { en: 'Silver Cuff Bracelet', ar: 'سوار فضي' },
    description: {
      en: 'A modern and bold silver cuff bracelet with a hammered texture finish.',
      ar: 'سوار فضي عصري وجريء بلمسة نهائية مطروقة.',
    },
    price: 107.800,
    imageUrl: 'https://picsum.photos/id/431/400/400',
    category: 'bracelets',
  },
  {
    id: '8',
    name: { en: 'Sapphire Stud Earrings', ar: 'أقراط ياقوت مرصعة' },
    description: {
      en: 'Deep blue sapphire stud earrings, perfect for adding a touch of color.',
      ar: 'أقراط ياقوت أزرق داكن مرصعة، مثالية لإضافة لمسة من اللون.',
    },
    price: 277.200,
    imageUrl: 'https://picsum.photos/id/659/400/400',
    category: 'earrings',
  },
];