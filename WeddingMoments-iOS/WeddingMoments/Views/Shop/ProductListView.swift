//
//  ProductListView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct ProductListView: View {
    @StateObject private var viewModel = ShopViewModel()
    @State private var selectedCategory: Product.ProductCategory?
    @State private var showCart = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Category Filter
                    categoryFilterView
                    
                    // Products Grid
                    if viewModel.products.isEmpty {
                        emptyStateView
                    } else {
                        productsGridView
                    }
                }
                .padding()
            }
            .navigationTitle("グッズ")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showCart = true }) {
                        ZStack(alignment: .topTrailing) {
                            Image(systemName: "cart")
                            
                            if viewModel.cartItemsCount > 0 {
                                Text("\(viewModel.cartItemsCount)")
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(width: 16, height: 16)
                                    .background(Color.red)
                                    .clipShape(Circle())
                                    .offset(x: 8, y: -8)
                            }
                        }
                    }
                }
            }
            .sheet(isPresented: $showCart) {
                CartView(viewModel: viewModel)
            }
            .task {
                await viewModel.fetchProducts()
            }
            .refreshable {
                await viewModel.fetchProducts(category: selectedCategory)
            }
        }
    }
    
    private var categoryFilterView: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                CategoryChip(
                    category: nil,
                    isSelected: selectedCategory == nil,
                    action: {
                        selectedCategory = nil
                        Task {
                            await viewModel.fetchProducts()
                        }
                    }
                )
                
                ForEach(Product.ProductCategory.allCases, id: \.self) { category in
                    CategoryChip(
                        category: category,
                        isSelected: selectedCategory == category,
                        action: {
                            selectedCategory = category
                            Task {
                                await viewModel.fetchProducts(category: category)
                            }
                        }
                    )
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "cart")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("グッズがまだありません")
                .font(.headline)
            
            Text("しばらくお待ちください")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 100)
    }
    
    private var productsGridView: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            ForEach(viewModel.products) { product in
                NavigationLink(destination: ProductDetailView(product: product, viewModel: viewModel)) {
                    ProductCard(product: product)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct CategoryChip: View {
    let category: Product.ProductCategory?
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                if let category = category {
                    Image(systemName: category.icon)
                    Text(category.displayName)
                } else {
                    Image(systemName: "square.grid.2x2")
                    Text("すべて")
                }
            }
            .font(.subheadline)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(isSelected ? Color.blue : Color.gray.opacity(0.2))
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(20)
        }
    }
}

struct ProductCard: View {
    let product: Product
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Product Image
            AsyncImage(url: URL(string: product.images.first ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
            }
            .frame(height: 150)
            .clipped()
            .cornerRadius(8)
            
            // Product Info
            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(2)
                
                Text(product.formattedPrice)
                    .font(.headline)
                    .foregroundColor(.blue)
                
                Text(product.stockStatus)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 4)
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

#Preview {
    ProductListView()
}
