export interface User {
  id: number
  username: string
  email: string
  phone: string
  password_hash: string
  timestamp: string
  stripe_account_id: string
}

export interface Product {
  id: number
  title: string
  description: string
  price: number
  category: "Textbooks" | "Electronics" | "Furniture" | "Clothing" | "Accessories" | "Dorm Essentials" | "Sports" | "Event Tickets" | "Services" | "Other"
  condition: string
  imageUrl: string
  timestamp: string
  isAvailable: boolean
  //status: "active" | "sold" | "reserved"
  sellerId: number
  sellerUsername: string
}

export interface Order {
  id: number
  buyerId: number
  productId: number
  timestamp: string
  status: string
}

export interface Notification {
  id: number;
  userId: number;  // ID of the user receiving the notification
  type: "message" | "offer" | "purchase" | "price_drop" | "system";
  title: string;
  message: string;
  timestamp: string;  // ISO format date string
  read: boolean;
  actionUrl?: string;
  senderId?: number;  // ID of the user sending the notification (if applicable)
  productId?: number;  // ID of the related product (if applicable)
  itemImage?: string;
}

export interface CartItem {
  id: number;
  title: string;
  userId: number;
  productId: number;
  price: number;
  imageUrl: string;
  timestamp: string;
  sellerStripeId: string
}