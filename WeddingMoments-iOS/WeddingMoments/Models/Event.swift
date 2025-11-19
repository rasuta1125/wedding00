//
//  Event.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import FirebaseFirestore

struct Event: Identifiable, Codable {
    @DocumentID var id: String?
    var eventId: String { id ?? "" }
    var hostUserId: String
    var eventName: String
    var eventDate: String
    var eventLocation: String?
    var qrToken: String
    var qrCodeUrl: String
    var guestLimit: Int
    var currentGuestCount: Int
    var status: EventStatus
    var photosPublishedAt: Timestamp?
    var autoPublish: Bool
    var publishTime: String
    var settings: EventSettings
    var subscriptionTier: SubscriptionTier
    var stripeSubscriptionId: String?
    var createdAt: Timestamp
    var updatedAt: Timestamp
    
    enum EventStatus: String, Codable {
        case draft = "draft"
        case active = "active"
        case ended = "ended"
        case archived = "archived"
    }
    
    enum SubscriptionTier: String, Codable {
        case basic = "basic"
        case standard = "standard"
        case premium = "premium"
    }
    
    struct EventSettings: Codable {
        var allowGuestDownload: Bool
        var watermark: Bool
        var compressionQuality: Double
        
        init(allowGuestDownload: Bool = true, watermark: Bool = false, compressionQuality: Double = 0.8) {
            self.allowGuestDownload = allowGuestDownload
            self.watermark = watermark
            self.compressionQuality = compressionQuality
        }
    }
    
    // Computed properties
    var formattedDate: Date? {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: eventDate)
    }
    
    var guestCountText: String {
        "\(currentGuestCount) / \(guestLimit) 名"
    }
    
    var isPublished: Bool {
        photosPublishedAt != nil
    }
}

// MARK: - Preview Helper
extension Event {
    static var preview: Event {
        Event(
            id: "preview_event_1",
            hostUserId: "user123",
            eventName: "山田太郎 & 花子 結婚式",
            eventDate: "2025-01-25",
            eventLocation: "東京ガーデンパレス",
            qrToken: "qr_token_sample",
            qrCodeUrl: "https://example.com/qr.png",
            guestLimit: 100,
            currentGuestCount: 45,
            status: .active,
            photosPublishedAt: nil,
            autoPublish: true,
            publishTime: "09:00",
            settings: EventSettings(),
            subscriptionTier: .standard,
            stripeSubscriptionId: nil,
            createdAt: Timestamp(date: Date()),
            updatedAt: Timestamp(date: Date())
        )
    }
}
