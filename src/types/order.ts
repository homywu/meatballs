export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderData {
  customer_name: string;
  phone_number: string;
  delivery_method: 'pickup_sage_hill' | 'delivery';
  delivery_address?: string;
  items: OrderItem[];
  total_amount: number;
  notes?: string;
  user_id?: string;
}

export interface Order extends OrderData {
  id: string;
  created_at: string;
  status: 'pending' | 'paid' | 'completed';
  user_id?: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
}
