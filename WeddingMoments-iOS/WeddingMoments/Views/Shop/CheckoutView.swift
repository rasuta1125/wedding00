//
//  CheckoutView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct CheckoutView: View {
    @ObservedObject var viewModel: ShopViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var postalCode = ""
    @State private var prefecture = ""
    @State private var city = ""
    @State private var address1 = ""
    @State private var address2 = ""
    @State private var eventId = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("配送先情報") {
                    TextField("お名前", text: $name)
                    TextField("メールアドレス", text: $email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    TextField("電話番号", text: $phone)
                        .keyboardType(.phonePad)
                }
                
                Section("住所") {
                    TextField("郵便番号", text: $postalCode)
                        .keyboardType(.numberPad)
                    TextField("都道府県", text: $prefecture)
                    TextField("市区町村", text: $city)
                    TextField("番地", text: $address1)
                    TextField("建物名・部屋番号（任意）", text: $address2)
                }
                
                Section("イベント") {
                    TextField("イベントID", text: $eventId)
                        .autocapitalization(.none)
                }
                
                Section("注文内容") {
                    ForEach(viewModel.cartItems) { item in
                        HStack {
                            Text(item.product.name)
                            Spacer()
                            Text("×\(item.quantity)")
                            Text(item.formattedTotalPrice)
                                .foregroundColor(.blue)
                        }
                        .font(.subheadline)
                    }
                    
                    HStack {
                        Text("合計")
                            .fontWeight(.bold)
                        Spacer()
                        Text("¥\(viewModel.cartTotal.formatted())")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                    }
                }
            }
            .navigationTitle("注文内容確認")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("支払いへ") {
                        Task {
                            await processCheckout()
                        }
                    }
                    .disabled(!isFormValid)
                }
            }
        }
    }
    
    private var isFormValid: Bool {
        !name.isEmpty &&
        !email.isEmpty &&
        !phone.isEmpty &&
        !postalCode.isEmpty &&
        !prefecture.isEmpty &&
        !city.isEmpty &&
        !address1.isEmpty &&
        !eventId.isEmpty
    }
    
    private func processCheckout() async {
        let shippingInfo = Order.ShippingInfo(
            name: name,
            email: email,
            phone: phone,
            postalCode: postalCode,
            prefecture: prefecture,
            city: city,
            address1: address1,
            address2: address2
        )
        
        let (success, clientSecret) = await viewModel.createOrder(
            eventId: eventId,
            shippingInfo: shippingInfo
        )
        
        if success, let clientSecret = clientSecret {
            // Here would integrate with Stripe SDK
            // For now, just dismiss
            print("Payment Intent Client Secret: \(clientSecret)")
            viewModel.clearCart()
            dismiss()
        }
    }
}

#Preview {
    CheckoutView(viewModel: ShopViewModel())
}
