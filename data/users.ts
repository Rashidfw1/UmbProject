import { User } from '../types';

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Customer One',
    email: 'customer1@example.com',
    password: 'password123',
    role: 'customer',
    status: 'active',
  },
  {
    id: '3',
    name: 'Customer Two',
    email: 'customer2@example.com',
    password: 'password123',
    role: 'customer',
    status: 'suspended',
  },
];