//
//  OrderSuccessView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct OrderSuccessView: View {
    let order: Order
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Success Icon
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.green)
                        .padding(.top, 40)
                    
                    // Success Message
                    VStack(spacing: 8) {
                        Text("ご注文ありがとうございました")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text("注文確認メールをお送りしました")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    // Order Info
                    VStack(alignment: .leading, spacing: 16) {
                        OrderInfoRow(title: "注文番号", value: order.orderNumber)
                        OrderInfoRow(
                            title: "お支払い金額",
                            value: "¥\(order.amounts.grandTotal.formatted())"
                        )
                        OrderInfoRow(
                            title: "配送先",
                            value: """
                            \(order.shippingInfo.name)
                            〒\(order.shippingInfo.postalCode)
                            \(order.shippingInfo.prefecture)\(order.shippingInfo.city)
                            \(order.shippingInfo.address1)
                            \(order.shippingInfo.address2 ?? "")
                            """
                        )
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(.secondarySystemBackground))
                    )
                    
                    // Order Steps
                    VStack(alignment: .leading, spacing: 16) {
                        Text("ご注文の流れ")
                            .font(.headline)
                        
                        OrderStepRow(
                            number: 1,
                            title: "注文確認",
                            description: "注文確認メールをお送りしました",
                            isCompleted: true
                        )
                        
                        OrderStepRow(
                            number: 2,
                            title: "商品作成",
                            description: "フォトアルバムを作成します（3-5営業日）",
                            isCompleted: false
                        )
                        
                        OrderStepRow(
                            number: 3,
                            title: "発送",
                            description: "発送完了メールをお送りします",
                            isCompleted: false
                        )
                        
                        OrderStepRow(
                            number: 4,
                            title: "お届け",
                            description: "配送完了（発送から2-3日）",
                            isCompleted: false
                        )
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(.secondarySystemBackground))
                    )
                    
                    // Action Button
                    Button {
                        dismiss()
                    } label: {
                        Text("閉じる")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.pink)
                            .cornerRadius(12)
                    }
                    .padding(.top, 16)
                }
                .padding()
            }
            .navigationTitle("注文完了")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Order Info Row
struct OrderInfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.body)
        }
    }
}

// MARK: - Order Step Row
struct OrderStepRow: View {
    let number: Int
    let title: String
    let description: String
    let isCompleted: Bool
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Step Number
            ZStack {
                Circle()
                    .fill(isCompleted ? Color.green : Color.gray.opacity(0.3))
                    .frame(width: 32, height: 32)
                
                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.caption)
                        .foregroundColor(.white)
                } else {
                    Text("\(number)")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.secondary)
                }
            }
            
            // Step Info
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

#Preview {
    let sampleOrder = Order(
        id: "order123",
        orderNumber: "WM20240101-0001",
        eventId: "event123",
        status: .paid,
        items: [],
        amounts: Order.OrderAmounts(
            subtotal: 15000,
            tax: 1500,
            shipping: 0,
            grandTotal: 16500
        ),
        shippingInfo: Order.ShippingInfo(
            name: "山田太郎",
            email: "test@example.com",
            phone: "090-1234-5678",
            postalCode: "100-0001",
            prefecture: "東京都",
            city: "千代田区",
            address1: "千代田1-1-1",
            address2: "マンション101"
        ),
        paymentInfo: Order.PaymentInfo(
            method: .creditCard,
            stripePaymentIntentId: "pi_123",
            paidAt: Date()
        ),
        createdAt: Date(),
        updatedAt: Date()
    )
    
    OrderSuccessView(order: sampleOrder)
}
