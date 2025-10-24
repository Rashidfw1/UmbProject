import { Coupon } from '../types';

export const coupons: Coupon[] = [
  {
    id: '1',
    code: 'SUMMER10',
    discountPercentage: 10,
    expiryDate: '2024-08-31',
    isActive: true,
  },
  {
    id: '2',
    code: 'WELCOME20',
    discountPercentage: 20,
    expiryDate: '2025-12-31',
    isActive: true,
  },
  {
    id: '3',
    code: 'EXPIRED',
    discountPercentage: 15,
    expiryDate: '2023-01-01',
    isActive: true,
  },
  {
    id: '4',
    code: 'INACTIVE',
    discountPercentage: 25,
    expiryDate: '2025-12-31',
    isActive: false,
  }
];