//
//  Photo.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import FirebaseFirestore

struct Photo: Identifiable, Codable {
    @DocumentID var id: String?
    var photoId: String { id ?? "" }
    var eventId: String
    var uploadedBy: String
    var uploaderType: UploaderType
    var originalUrl: String
    var thumbnailUrl: String
    var mediumUrl: String
    var imageMetadata: ImageMetadata
    var isPublished: Bool
    var uploadedAt: Timestamp
    var publishedAt: Timestamp?
    
    enum UploaderType: String, Codable {
        case host = "host"
        case guest = "guest"
    }
    
    struct ImageMetadata: Codable {
        var width: Int
        var height: Int
        var size: Int
        var format: String
        var exif: [String: String]?
        
        init(width: Int, height: Int, size: Int, format: String, exif: [String: String]? = nil) {
            self.width = width
            self.height = height
            self.size = size
            self.format = format
            self.exif = exif
        }
    }
    
    // Computed properties
    var sizeInMB: String {
        let mb = Double(imageMetadata.size) / 1_048_576
        return String(format: "%.2f MB", mb)
    }
    
    var aspectRatio: Double {
        Double(imageMetadata.width) / Double(imageMetadata.height)
    }
}

// MARK: - Preview Helper
extension Photo {
    static var preview: Photo {
        Photo(
            id: "photo_preview_1",
            eventId: "event_123",
            uploadedBy: "guest_token_123",
            uploaderType: .guest,
            originalUrl: "https://picsum.photos/800/600",
            thumbnailUrl: "https://picsum.photos/200/200",
            mediumUrl: "https://picsum.photos/400/400",
            imageMetadata: ImageMetadata(width: 800, height: 600, size: 2_048_000, format: "jpg"),
            isPublished: true,
            uploadedAt: Timestamp(date: Date()),
            publishedAt: Timestamp(date: Date())
        )
    }
    
    static var previews: [Photo] {
        (1...10).map { index in
            Photo(
                id: "photo_preview_\(index)",
                eventId: "event_123",
                uploadedBy: "guest_token_\(index)",
                uploaderType: .guest,
                originalUrl: "https://picsum.photos/800/600?random=\(index)",
                thumbnailUrl: "https://picsum.photos/200/200?random=\(index)",
                mediumUrl: "https://picsum.photos/400/400?random=\(index)",
                imageMetadata: ImageMetadata(width: 800, height: 600, size: 2_048_000, format: "jpg"),
                isPublished: true,
                uploadedAt: Timestamp(date: Date().addingTimeInterval(TimeInterval(-index * 3600))),
                publishedAt: Timestamp(date: Date())
            )
        }
    }
}
