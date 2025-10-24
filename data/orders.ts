
import { Order } from '../types';

export const orders: Order[] = [
    {
        id: 'ORD001',
        userId: '2',
        userName: 'Customer One',
        date: '2024-07-20',
        items: [
            { productId: '1', productName: { en: 'Serene Diamond Necklace', ar: 'قلادة الألماس الهادئة' }, quantity: 1, price: 481.250 },
            { productId: '4', productName: { en: 'Emerald Drop Earrings', ar: 'أقراط الزمرد المتدلية' }, quantity: 1, price: 377.300 }
        ],
        total: 858.550,
        status: 'delivered',
    },
    {
        id: 'ORD002',
        userId: '3',
        userName: 'Customer Two',
        date: '2024-07-21',
        items: [
            { productId: '6', productName: { en: 'Rose Gold Band', ar: 'خاتم من الذهب الوردي' }, quantity: 2, price: 115.500 }
        ],
        total: 231.000,
        status: 'shipped',
    },
    {
        id: 'ORD003',
        userId: '2',
        userName: 'Customer One',
        date: '2024-07-22',
        items: [
            { productId: '3', productName: { en: 'Azure Charm Bracelet', ar: 'سوار السحر اللازوردي' }, quantity: 1, price: 161.700 }
        ],
        total: 161.700,
        status: 'processing',
    },
];