export type Role = 'Admin' | 'Owner' | 'Manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive';
  logoUrl?: string;
  rating?: number;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Rejected';

export interface Order {
  id: string;
  restaurantId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
  categoryId: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
}
