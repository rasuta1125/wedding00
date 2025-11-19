//
//  CartView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct CartView: View {
    @ObservedObject var viewModel: ShopViewModel
    @Environment(\.dismiss) var dismiss
    @State private var showCheckout = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.cartItems.isEmpty {
                    emptyCartView
                } else {
                    cartListView
                }
            }
            .navigationTitle("カート")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("閉じる") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showCheckout) {
                CheckoutView(viewModel: viewModel)
            }
        }
    }
    
    private var emptyCartView: some View {
        VStack(spacing: 20) {
            Image(systemName: "cart")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("カートが空です")
                .font(.headline)
            
            Text("グッズを追加してください")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Button(action: { dismiss() }) {
                Text("買い物を続ける")
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
        }
    }
    
    private var cartListView: some View {
        VStack {
            List {
                ForEach(viewModel.cartItems) { item in
                    CartItemRow(item: item, viewModel: viewModel)
                }
                .onDelete { indexSet in
                    indexSet.forEach { index in
                        viewModel.removeFromCart(item: viewModel.cartItems[index])
                    }
                }
            }
            
            // Total and Checkout
            VStack(spacing: 16) {
                Divider()
                
                HStack {
                    Text("小計")
                        .font(.headline)
                    
                    Spacer()
                    
                    Text("¥\(viewModel.cartTotal.formatted())")
                        .font(.title2)
                        .fontWeight(.bold)
                }
                .padding(.horizontal)
                
                Button(action: { showCheckout = true }) {
                    Label("レジに進む", systemImage: "creditcard")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
            .background(Color(.systemBackground))
        }
    }
}

struct CartItemRow: View {
    let item: ShopViewModel.CartItem
    @ObservedObject var viewModel: ShopViewModel
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Product Image
            AsyncImage(url: URL(string: item.product.images.first ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
            }
            .frame(width: 80, height: 80)
            .clipped()
            .cornerRadius(8)
            
            // Product Info
            VStack(alignment: .leading, spacing: 4) {
                Text(item.product.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                if !item.selectedOptions.isEmpty {
                    ForEach(Array(item.selectedOptions.keys), id: \.self) { key in
                        if let value = item.selectedOptions[key] {
                            Text("\(key): \(value)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                HStack {
                    // Quantity Controls
                    HStack(spacing: 8) {
                        Button(action: {
                            viewModel.updateQuantity(item: item, quantity: item.quantity - 1)
                        }) {
                            Image(systemName: "minus.circle")
                        }
                        .disabled(item.quantity <= 1)
                        
                        Text("\(item.quantity)")
                            .frame(minWidth: 30)
                        
                        Button(action: {
                            viewModel.updateQuantity(item: item, quantity: item.quantity + 1)
                        }) {
                            Image(systemName: "plus.circle")
                        }
                    }
                    
                    Spacer()
                    
                    Text(item.formattedTotalPrice)
                        .font(.headline)
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    CartView(viewModel: ShopViewModel())
}
