//
//  Product.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import FirebaseFirestore

struct Product: Identifiable, Codable {
    @DocumentID var id: String?
    var productId: String { id ?? "" }
    var name: String
    var description: String
    var category: ProductCategory
    var basePrice: Int
    var images: [String]
    var options: [ProductOption]
    var stockQuantity: Int?
    var isActive: Bool
    var sortOrder: Int
    var createdAt: Timestamp
    var updatedAt: Timestamp
    
    enum ProductCategory: String, Codable, CaseIterable {
        case album = "album"
        case frame = "frame"
        case keychain = "keychain"
        case mug = "mug"
        case calendar = "calendar"
        case card = "card"
        
        var displayName: String {
            switch self {
            case .album: return "フォトアルバム"
            case .frame: return "フォトフレーム"
            case .keychain: return "キーホルダー"
            case .mug: return "マグカップ"
            case .calendar: return "カレンダー"
            case .card: return "グリーティングカード"
            }
        }
        
        var icon: String {
            switch self {
            case .album: return "book.closed"
            case .frame: return "photo.on.rectangle"
            case .keychain: return "key"
            case .mug: return "cup.and.saucer"
            case .calendar: return "calendar"
            case .card: return "envelope"
            }
        }
    }
    
    struct ProductOption: Codable, Identifiable {
        var id: String { optionId }
        var optionId: String
        var name: String
        var values: [OptionValue]
        
        struct OptionValue: Codable, Identifiable {
            var id: String { value }
            var value: String
            var priceModifier: Int
            
            var displayText: String {
                if priceModifier > 0 {
                    return "\(value) (+¥\(priceModifier))"
                } else if priceModifier < 0 {
                    return "\(value) (-¥\(abs(priceModifier)))"
                } else {
                    return value
                }
            }
        }
    }
    
    // Computed properties
    var formattedPrice: String {
        "¥\(basePrice.formatted())"
    }
    
    var stockStatus: String {
        if let stock = stockQuantity {
            return stock > 0 ? "在庫: \(stock)個" : "在庫切れ"
        }
        return "受注生産"
    }
    
    var isInStock: Bool {
        stockQuantity == nil || (stockQuantity ?? 0) > 0
    }
}

// MARK: - Preview Helper
extension Product {
    static var preview: Product {
        Product(
            id: "product_preview_1",
            name: "フォトアルバム（A4サイズ）",
            description: "結婚式の思い出を高品質なアルバムに。30ページ、最大120枚の写真を収録可能。",
            category: .album,
            basePrice: 8900,
            images: [
                "https://picsum.photos/400/400?random=album1",
                "https://picsum.photos/400/400?random=album2"
            ],
            options: [
                ProductOption(
                    optionId: "size",
                    name: "サイズ",
                    values: [
                        ProductOption.OptionValue(value: "A4", priceModifier: 0),
                        ProductOption.OptionValue(value: "A5", priceModifier: -1000),
                        ProductOption.OptionValue(value: "A3", priceModifier: 2000)
                    ]
                ),
                ProductOption(
                    optionId: "cover",
                    name: "カバータイプ",
                    values: [
                        ProductOption.OptionValue(value: "ソフトカバー", priceModifier: 0),
                        ProductOption.OptionValue(value: "ハードカバー", priceModifier: 1500)
                    ]
                )
            ],
            stockQuantity: nil,
            isActive: true,
            sortOrder: 1,
            createdAt: Timestamp(date: Date()),
            updatedAt: Timestamp(date: Date())
        )
    }
    
    static var previews: [Product] {
        [
            Product.preview,
            Product(
                id: "product_preview_2",
                name: "フォトフレーム（木製）",
                description: "温かみのある木製フレーム。お気に入りの一枚を飾るのに最適。",
                category: .frame,
                basePrice: 2900,
                images: ["https://picsum.photos/400/400?random=frame"],
                options: [],
                stockQuantity: 50,
                isActive: true,
                sortOrder: 2,
                createdAt: Timestamp(date: Date()),
                updatedAt: Timestamp(date: Date())
            ),
            Product(
                id: "product_preview_3",
                name: "オリジナルマグカップ",
                description: "お気に入りの写真をプリントしたマグカップ。毎日の生活に幸せを。",
                category: .mug,
                basePrice: 1800,
                images: ["https://picsum.photos/400/400?random=mug"],
                options: [],
                stockQuantity: 100,
                isActive: true,
                sortOrder: 3,
                createdAt: Timestamp(date: Date()),
                updatedAt: Timestamp(date: Date())
            )
        ]
    }
}
