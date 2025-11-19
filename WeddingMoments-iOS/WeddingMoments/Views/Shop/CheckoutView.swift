//
//  CheckoutView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct CheckoutView: View {
    @ObservedObject var viewModel: ShopViewModel
    @StateObject private var stripeService = StripeService()
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
    @State private var showingPaymentSuccess = false
    @State private var showingError = false
    @State private var errorMessage = ""
    @State private var completedOrder: Order?
    @State private var orderId: String?
    
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
                    .disabled(stripeService.isProcessing || viewModel.isLoading)
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("支払いへ") {
                        Task {
                            await processCheckout()
                        }
                    }
                    .disabled(!isFormValid || stripeService.isProcessing || viewModel.isLoading)
                }
            }
            .overlay {
                if stripeService.isProcessing || viewModel.isLoading {
                    ZStack {
                        Color.black.opacity(0.3)
                            .ignoresSafeArea()
                        
                        VStack(spacing: 16) {
                            ProgressView()
                                .scaleEffect(1.5)
                            Text(viewModel.isLoading ? "注文を作成中..." : "お支払い処理中...")
                                .font(.subheadline)
                                .foregroundColor(.white)
                        }
                        .padding(24)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemBackground))
                        )
                    }
                }
            }
            .sheet(item: $completedOrder) { order in
                OrderSuccessView(order: order)
                    .onDisappear {
                        viewModel.clearCart()
                        dismiss()
                    }
            }
            .alert("エラー", isPresented: $showingError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
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
        // Step 1: Create order and get client secret
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
        
        let (success, clientSecret, orderId) = await viewModel.createOrder(
            eventId: eventId,
            shippingInfo: shippingInfo
        )
        
        guard success, let clientSecret = clientSecret, let orderId = orderId else {
            errorMessage = viewModel.errorMessage ?? "注文の作成に失敗しました"
            showingError = true
            return
        }
        
        // Store orderId for later use
        self.orderId = orderId
        
        // Step 2: Prepare Stripe Payment Sheet
        let prepared = await stripeService.preparePaymentSheet(
            clientSecret: clientSecret,
            merchantDisplayName: Config.Stripe.merchantDisplayName
        )
        
        guard prepared else {
            errorMessage = stripeService.errorMessage ?? "お支払いの準備に失敗しました"
            showingError = true
            return
        }
        
        // Step 3: Present Payment Sheet
        let result = await stripeService.presentPaymentSheet()
        
        // Step 4: Handle Payment Result
        let (paymentSuccess, message) = stripeService.handlePaymentResult(result)
        
        if paymentSuccess {
            // Fetch completed order and show success view
            if let order = await viewModel.getOrder(orderId: orderId) {
                completedOrder = order
            } else {
                // Payment succeeded but couldn't fetch order, still show success
                showingPaymentSuccess = true
            }
        } else {
            errorMessage = message
            showingError = true
        }
    }
}

#Preview {
    CheckoutView(viewModel: ShopViewModel())
}
