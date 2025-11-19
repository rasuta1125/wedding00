//
//  ProductDetailView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @ObservedObject var viewModel: ShopViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var quantity = 1
    @State private var selectedOptions: [String: String] = [:]
    @State private var showAddedToCartAlert = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Product Images
                productImagesView
                
                // Product Info
                VStack(alignment: .leading, spacing: 12) {
                    Text(product.name)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    HStack {
                        Text(calculatedPrice)
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                        
                        Spacer()
                        
                        Text(product.stockStatus)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Text(product.description)
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
                
                Divider()
                    .padding(.horizontal)
                
                // Options
                if !product.options.isEmpty {
                    optionsView
                }
                
                // Quantity Selector
                quantityView
                
                Spacer(minLength: 100)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .bottomBar) {
                Button(action: addToCart) {
                    Label("カートに追加", systemImage: "cart.badge.plus")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(product.isInStock ? Color.blue : Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .disabled(!product.isInStock)
            }
        }
        .alert("カートに追加しました", isPresented: $showAddedToCartAlert) {
            Button("OK") { }
            Button("カートを見る") {
                // Navigate to cart
            }
        }
        .onAppear {
            // Initialize default options
            for option in product.options {
                if let firstValue = option.values.first {
                    selectedOptions[option.optionId] = firstValue.value
                }
            }
        }
    }
    
    private var productImagesView: some View {
        TabView {
            ForEach(product.images, id: \.self) { imageUrl in
                AsyncImage(url: URL(string: imageUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                }
            }
        }
        .frame(height: 300)
        .tabViewStyle(.page)
    }
    
    private var optionsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            ForEach(product.options) { option in
                VStack(alignment: .leading, spacing: 8) {
                    Text(option.name)
                        .font(.headline)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(option.values) { value in
                                Button(action: {
                                    selectedOptions[option.optionId] = value.value
                                }) {
                                    Text(value.displayText)
                                        .font(.subheadline)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(
                                            selectedOptions[option.optionId] == value.value ?
                                            Color.blue : Color.gray.opacity(0.2)
                                        )
                                        .foregroundColor(
                                            selectedOptions[option.optionId] == value.value ?
                                            .white : .primary
                                        )
                                        .cornerRadius(8)
                                }
                            }
                        }
                    }
                }
            }
        }
        .padding(.horizontal)
    }
    
    private var quantityView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("数量")
                .font(.headline)
            
            HStack {
                Button(action: { if quantity > 1 { quantity -= 1 } }) {
                    Image(systemName: "minus.circle.fill")
                        .font(.title2)
                        .foregroundColor(quantity > 1 ? .blue : .gray)
                }
                .disabled(quantity <= 1)
                
                Text("\(quantity)")
                    .font(.title3)
                    .fontWeight(.semibold)
                    .frame(minWidth: 50)
                
                Button(action: { 
                    if let stock = product.stockQuantity {
                        if quantity < stock {
                            quantity += 1
                        }
                    } else {
                        quantity += 1
                    }
                }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(.horizontal)
    }
    
    private var calculatedPrice: String {
        var price = product.basePrice
        
        for (optionId, value) in selectedOptions {
            if let option = product.options.first(where: { $0.optionId == optionId }),
               let optionValue = option.values.first(where: { $0.value == value }) {
                price += optionValue.priceModifier
            }
        }
        
        let total = price * quantity
        return "¥\(total.formatted())"
    }
    
    private func addToCart() {
        viewModel.addToCart(
            product: product,
            quantity: quantity,
            selectedOptions: selectedOptions
        )
        showAddedToCartAlert = true
    }
}

#Preview {
    NavigationStack {
        ProductDetailView(product: .preview, viewModel: ShopViewModel())
    }
}
