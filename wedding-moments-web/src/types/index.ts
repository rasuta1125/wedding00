// Event Types
export interface Event {
  id: string
  hostUserId: string
  eventName: string
  eventDate: string
  eventLocation?: string
  qrToken: string
  qrCodeUrl: string
  guestLimit: number
  currentGuestCount: number
  status: 'draft' | 'active' | 'ended' | 'archived'
  photosPublishedAt?: Date
  autoPublish: boolean
  publishTime: string
  settings: EventSettings
  subscriptionTier: 'basic' | 'standard' | 'premium'
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface EventSettings {
  allowGuestDownload: boolean
  watermark: boolean
  compressionQuality: number
}

// Photo Types
export interface Photo {
  id: string
  eventId: string
  uploadedBy: string
  uploaderType: 'host' | 'guest'
  originalUrl: string
  thumbnailUrl: string
  mediumUrl: string
  imageMetadata: ImageMetadata
  isPublished: boolean
  uploadedAt: Date
  publishedAt?: Date
}

export interface ImageMetadata {
  width: number
  height: number
  size: number
  format: string
  exif?: Record<string, any>
}

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  category: 'album' | 'frame' | 'keychain' | 'mug' | 'calendar' | 'card'
  basePrice: number
  images: string[]
  options: ProductOption[]
  stockQuantity?: number
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductOption {
  optionId: string
  name: string
  values: OptionValue[]
}

export interface OptionValue {
  value: string
  priceModifier: number
}

// Order Types
export interface Order {
  id: string
  eventId: string
  orderNumber: string
  items: OrderItem[]
  shippingInfo: ShippingInfo
  amounts: OrderAmounts
  payment: PaymentInfo
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber?: string
  shippedAt?: Date
  deliveredAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  selectedOptions: SelectedOption[]
  subtotal: number
}

export interface SelectedOption {
  optionId: string
  value: string
}

export interface ShippingInfo {
  name: string
  email: string
  phone: string
  postalCode: string
  prefecture: string
  city: string
  address1: string
  address2?: string
}

export interface OrderAmounts {
  subtotal: number
  tax: number
  shipping: number
  total: number
}

export interface PaymentInfo {
  method: string
  stripePaymentIntentId: string
  stripeChargeId?: string
  paidAt?: Date
}

// Guest Session Types
export interface GuestSession {
  sessionId: string
  eventId: string
  guestToken: string
  deviceInfo: string
  ipAddress: string
  expiresAt: Date
  lastAccessAt: Date
  createdAt: Date
}

// Cart Types (Client-side only)
export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedOptions: Record<string, string>
}
