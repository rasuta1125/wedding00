//
//  Order.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import FirebaseFirestore

struct Order: Identifiable, Codable {
    @DocumentID var id: String?
    var orderId: String { id ?? "" }
    var eventId: String
    var orderNumber: String
    var items: [OrderItem]
    var shippingInfo: ShippingInfo
    var amounts: OrderAmounts
    var payment: PaymentInfo
    var status: OrderStatus
    var trackingNumber: String?
    var shippedAt: Timestamp?
    var deliveredAt: Timestamp?
    var notes: String?
    var createdAt: Timestamp
    var updatedAt: Timestamp
    
    struct OrderItem: Codable, Identifiable {
        var id = UUID()
        var productId: String
        var productName: String
        var quantity: Int
        var unitPrice: Int
        var selectedOptions: [SelectedOption]
        var subtotal: Int
        
        struct SelectedOption: Codable {
            var optionId: String
            var value: String
        }
        
        var formattedSubtotal: String {
            "¥\(subtotal.formatted())"
        }
    }
    
    struct ShippingInfo: Codable {
        var name: String
        var email: String
        var phone: String
        var postalCode: String
        var prefecture: String
        var city: String
        var address1: String
        var address2: String?
        
        var fullAddress: String {
            var parts = [postalCode, prefecture, city, address1]
            if let addr2 = address2, !addr2.isEmpty {
                parts.append(addr2)
            }
            return parts.joined(separator: " ")
        }
    }
    
    struct OrderAmounts: Codable {
        var subtotal: Int
        var tax: Int
        var shipping: Int
        var total: Int
        
        var formattedSubtotal: String { "¥\(subtotal.formatted())" }
        var formattedTax: String { "¥\(tax.formatted())" }
        var formattedShipping: String { "¥\(shipping.formatted())" }
        var formattedTotal: String { "¥\(total.formatted())" }
    }
    
    struct PaymentInfo: Codable {
        var method: String
        var stripePaymentIntentId: String
        var stripeChargeId: String?
        var paidAt: Timestamp?
        
        var isPaid: Bool {
            paidAt != nil
        }
    }
    
    enum OrderStatus: String, Codable {
        case pending = "pending"
        case paid = "paid"
        case processing = "processing"
        case shipped = "shipped"
        case delivered = "delivered"
        case cancelled = "cancelled"
        
        var displayName: String {
            switch self {
            case .pending: return "支払い待ち"
            case .paid: return "支払い済み"
            case .processing: return "制作中"
            case .shipped: return "発送済み"
            case .delivered: return "配達完了"
            case .cancelled: return "キャンセル"
            }
        }
        
        var color: String {
            switch self {
            case .pending: return "orange"
            case .paid: return "blue"
            case .processing: return "purple"
            case .shipped: return "teal"
            case .delivered: return "green"
            case .cancelled: return "red"
            }
        }
        
        var icon: String {
            switch self {
            case .pending: return "clock"
            case .paid: return "checkmark.circle"
            case .processing: return "hammer"
            case .shipped: return "shippingbox"
            case .delivered: return "house"
            case .cancelled: return "xmark.circle"
            }
        }
    }
    
    // Computed properties
    var itemsCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }
    
    var canBeCancelled: Bool {
        status == .pending || status == .paid
    }
}

// MARK: - Preview Helper
extension Order {
    static var preview: Order {
        Order(
            id: "order_preview_1",
            eventId: "event_123",
            orderNumber: "WM20250125-001",
            items: [
                OrderItem(
                    productId: "prod_001",
                    productName: "フォトアルバム（A4サイズ）",
                    quantity: 2,
                    unitPrice: 8900,
                    selectedOptions: [
                        OrderItem.SelectedOption(optionId: "size", value: "A4"),
                        OrderItem.SelectedOption(optionId: "cover", value: "ハードカバー")
                    ],
                    subtotal: 17800
                ),
                OrderItem(
                    productId: "prod_002",
                    productName: "フォトフレーム（木製）",
                    quantity: 1,
                    unitPrice: 2900,
                    selectedOptions: [],
                    subtotal: 2900
                )
            ],
            shippingInfo: ShippingInfo(
                name: "山田太郎",
                email: "taro.yamada@example.com",
                phone: "090-1234-5678",
                postalCode: "100-0001",
                prefecture: "東京都",
                city: "千代田区",
                address1: "千代田1-1-1",
                address2: "マンション101"
            ),
            amounts: OrderAmounts(
                subtotal: 20700,
                tax: 2070,
                shipping: 800,
                total: 23570
            ),
            payment: PaymentInfo(
                method: "stripe",
                stripePaymentIntentId: "pi_abc123",
                stripeChargeId: "ch_xyz789",
                paidAt: Timestamp(date: Date())
            ),
            status: .paid,
            trackingNumber: nil,
            shippedAt: nil,
            deliveredAt: nil,
            notes: nil,
            createdAt: Timestamp(date: Date()),
            updatedAt: Timestamp(date: Date())
        )
    }
}
