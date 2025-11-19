// Shared types for Firebase Functions

export interface Event {
  eventId: string;
  hostUserId: string;
  eventName: string;
  eventDate: string;
  eventLocation?: string;
  qrToken: string;
  qrCodeUrl: string;
  guestLimit: number;
  currentGuestCount: number;
  status: 'draft' | 'active' | 'ended' | 'archived';
  photosPublishedAt?: FirebaseFirestore.Timestamp;
  autoPublish: boolean;
  publishTime: string;
  settings: EventSettings;
  subscriptionTier: 'basic' | 'standard' | 'premium';
  stripeSubscriptionId?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface EventSettings {
  allowGuestDownload: boolean;
  watermark: boolean;
  compressionQuality: number;
}

export interface Photo {
  photoId: string;
  eventId: string;
  uploadedBy: string;
  uploaderType: 'host' | 'guest';
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  imageMetadata: ImageMetadata;
  isPublished: boolean;
  uploadedAt: FirebaseFirestore.Timestamp;
  publishedAt?: FirebaseFirestore.Timestamp;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
  exif?: Record<string, any>;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  category: 'album' | 'frame' | 'keychain' | 'mug' | 'calendar' | 'card';
  basePrice: number;
  images: string[];
  options: ProductOption[];
  stockQuantity?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface ProductOption {
  optionId: string;
  name: string;
  values: OptionValue[];
}

export interface OptionValue {
  value: string;
  priceModifier: number;
}

export interface Order {
  orderId: string;
  eventId: string;
  orderNumber: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  amounts: OrderAmounts;
  payment: PaymentInfo;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  shippedAt?: FirebaseFirestore.Timestamp;
  deliveredAt?: FirebaseFirestore.Timestamp;
  notes?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: SelectedOption[];
  subtotal: number;
}

export interface SelectedOption {
  optionId: string;
  value: string;
}

export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
}

export interface OrderAmounts {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface PaymentInfo {
  method: string;
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  paidAt?: FirebaseFirestore.Timestamp;
}

// API Request/Response Types
export interface CreateEventRequest {
  eventName: string;
  eventDate: string;
  eventLocation?: string;
  guestLimit: number;
  autoPublish?: boolean;
  publishTime?: string;
}

export interface CreateEventResponse {
  success: boolean;
  eventId?: string;
  qrCodeUrl?: string;
  qrToken?: string;
  error?: string;
}

export interface CreateOrderRequest {
  eventId: string;
  items: {
    productId: string;
    quantity: number;
    selectedOptions: SelectedOption[];
  }[];
  shippingInfo: ShippingInfo;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  clientSecret?: string;
  error?: string;
}
