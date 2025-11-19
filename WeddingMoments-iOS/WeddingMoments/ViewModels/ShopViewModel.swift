//
//  ShopViewModel.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import FirebaseFirestore
import FirebaseFunctions

@MainActor
class ShopViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var cartItems: [CartItem] = []
    @Published var orders: [Order] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let db = Firestore.firestore()
    private let functions = Functions.functions()
    
    // MARK: - Cart Item
    struct CartItem: Identifiable {
        var id = UUID()
        var product: Product
        var quantity: Int
        var selectedOptions: [String: String] // optionId: value
        
        var totalPrice: Int {
            var price = product.basePrice
            
            // Add option modifiers
            for (optionId, value) in selectedOptions {
                if let option = product.options.first(where: { $0.optionId == optionId }),
                   let optionValue = option.values.first(where: { $0.value == value }) {
                    price += optionValue.priceModifier
                }
            }
            
            return price * quantity
        }
        
        var formattedTotalPrice: String {
            "¥\(totalPrice.formatted())"
        }
    }
    
    // MARK: - Fetch Products
    func fetchProducts(category: Product.ProductCategory? = nil) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            var query = db.collection("products")
                .whereField("isActive", isEqualTo: true)
            
            if let category = category {
                query = query.whereField("category", isEqualTo: category.rawValue)
            }
            
            let snapshot = try await query
                .order(by: "sortOrder")
                .getDocuments()
            
            products = snapshot.documents.compactMap { doc in
                try? doc.data(as: Product.self)
            }
        } catch {
            errorMessage = "商品の取得に失敗しました: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Cart Management
    func addToCart(product: Product, quantity: Int = 1, selectedOptions: [String: String] = [:]) {
        // Check if same product with same options exists
        if let existingIndex = cartItems.firstIndex(where: { 
            $0.product.id == product.id && $0.selectedOptions == selectedOptions 
        }) {
            cartItems[existingIndex].quantity += quantity
        } else {
            let cartItem = CartItem(
                product: product,
                quantity: quantity,
                selectedOptions: selectedOptions
            )
            cartItems.append(cartItem)
        }
    }
    
    func removeFromCart(item: CartItem) {
        cartItems.removeAll { $0.id == item.id }
    }
    
    func updateQuantity(item: CartItem, quantity: Int) {
        if let index = cartItems.firstIndex(where: { $0.id == item.id }) {
            if quantity <= 0 {
                cartItems.remove(at: index)
            } else {
                cartItems[index].quantity = quantity
            }
        }
    }
    
    func clearCart() {
        cartItems.removeAll()
    }
    
    var cartTotal: Int {
        cartItems.reduce(0) { $0 + $1.totalPrice }
    }
    
    var cartItemsCount: Int {
        cartItems.reduce(0) { $0 + $1.quantity }
    }
    
    // MARK: - Create Order
    func createOrder(
        eventId: String,
        shippingInfo: Order.ShippingInfo
    ) async -> (success: Bool, clientSecret: String?) {
        isLoading = true
        defer { isLoading = false }
        
        guard !cartItems.isEmpty else {
            errorMessage = "カートが空です"
            return (false, nil)
        }
        
        // Prepare order items
        let orderItems = cartItems.map { item -> [String: Any] in
            let selectedOptions = item.selectedOptions.map { (key, value) -> [String: String] in
                ["optionId": key, "value": value]
            }
            
            return [
                "productId": item.product.productId,
                "quantity": item.quantity,
                "selectedOptions": selectedOptions
            ]
        }
        
        let data: [String: Any] = [
            "eventId": eventId,
            "items": orderItems,
            "shippingInfo": [
                "name": shippingInfo.name,
                "email": shippingInfo.email,
                "phone": shippingInfo.phone,
                "postalCode": shippingInfo.postalCode,
                "prefecture": shippingInfo.prefecture,
                "city": shippingInfo.city,
                "address1": shippingInfo.address1,
                "address2": shippingInfo.address2 ?? ""
            ]
        ]
        
        do {
            let result = try await functions.httpsCallable("createOrder").call(data)
            
            if let response = result.data as? [String: Any],
               let success = response["success"] as? Bool, success,
               let clientSecret = response["clientSecret"] as? String {
                return (true, clientSecret)
            } else {
                errorMessage = "注文の作成に失敗しました"
                return (false, nil)
            }
        } catch {
            errorMessage = "注文の作成に失敗しました: \(error.localizedDescription)"
            return (false, nil)
        }
    }
    
    // MARK: - Fetch Orders
    func fetchOrders(eventId: String) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let snapshot = try await db.collection("orders")
                .whereField("eventId", isEqualTo: eventId)
                .order(by: "createdAt", descending: true)
                .getDocuments()
            
            orders = snapshot.documents.compactMap { doc in
                try? doc.data(as: Order.self)
            }
        } catch {
            errorMessage = "注文の取得に失敗しました: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Get Order Detail
    func getOrder(orderId: String) async -> Order? {
        do {
            let document = try await db.collection("orders").document(orderId).getDocument()
            return try? document.data(as: Order.self)
        } catch {
            errorMessage = "注文の取得に失敗しました: \(error.localizedDescription)"
            return nil
        }
    }
}
