//
//  PhotoViewModel.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import FirebaseFirestore
import FirebaseStorage
import FirebaseFunctions
import SwiftUI

@MainActor
class PhotoViewModel: ObservableObject {
    @Published var photos: [Photo] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var uploadProgress: Double = 0
    
    private let db = Firestore.firestore()
    private let storage = Storage.storage()
    private let functions = Functions.functions()
    private var listener: ListenerRegistration?
    
    // MARK: - Fetch Photos
    func fetchPhotos(eventId: String, publishedOnly: Bool = true) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            var query = db.collection("photos")
                .whereField("eventId", isEqualTo: eventId)
            
            if publishedOnly {
                query = query.whereField("isPublished", isEqualTo: true)
            }
            
            let snapshot = try await query
                .order(by: "uploadedAt", descending: true)
                .getDocuments()
            
            photos = snapshot.documents.compactMap { doc in
                try? doc.data(as: Photo.self)
            }
        } catch {
            errorMessage = "写真の取得に失敗しました: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Upload Photo
    func uploadPhoto(eventId: String, image: UIImage) async -> Bool {
        isLoading = true
        uploadProgress = 0
        defer { isLoading = false }
        
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            errorMessage = "画像の圧縮に失敗しました"
            return false
        }
        
        let photoId = UUID().uuidString
        let storageRef = storage.reference()
            .child("events/\(eventId)/photos/\(photoId).jpg")
        
        do {
            // Upload to Firebase Storage
            let metadata = StorageMetadata()
            metadata.contentType = "image/jpeg"
            
            let _ = try await storageRef.putDataAsync(imageData, metadata: metadata) { [weak self] progress in
                guard let self = self, let progress = progress else { return }
                Task { @MainActor in
                    self.uploadProgress = Double(progress.completedUnitCount) / Double(progress.totalUnitCount)
                }
            }
            
            // Get download URL
            let downloadURL = try await storageRef.downloadURL()
            
            // Create Firestore document
            let photoData: [String: Any] = [
                "eventId": eventId,
                "uploadedBy": Auth.auth().currentUser?.uid ?? "unknown",
                "uploaderType": "host",
                "originalUrl": downloadURL.absoluteString,
                "thumbnailUrl": downloadURL.absoluteString, // TODO: Generate thumbnails
                "mediumUrl": downloadURL.absoluteString,
                "imageMetadata": [
                    "width": Int(image.size.width),
                    "height": Int(image.size.height),
                    "size": imageData.count,
                    "format": "jpg"
                ],
                "isPublished": false,
                "uploadedAt": FieldValue.serverTimestamp(),
                "publishedAt": NSNull()
            ]
            
            try await db.collection("photos").addDocument(data: photoData)
            await fetchPhotos(eventId: eventId, publishedOnly: false)
            
            return true
        } catch {
            errorMessage = "写真のアップロードに失敗しました: \(error.localizedDescription)"
            return false
        }
    }
    
    // MARK: - Delete Photo
    func deletePhoto(_ photo: Photo) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            // Delete from Firestore
            try await db.collection("photos").document(photo.photoId).delete()
            
            // Delete from Storage
            let storageRef = storage.reference(forURL: photo.originalUrl)
            try await storageRef.delete()
            
            // Remove from local array
            photos.removeAll { $0.id == photo.id }
            
            return true
        } catch {
            errorMessage = "写真の削除に失敗しました: \(error.localizedDescription)"
            return false
        }
    }
    
    // MARK: - Download Album
    func downloadAlbum(eventId: String) async -> URL? {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let result = try await functions.httpsCallable("downloadAlbum").call(["eventId": eventId])
            
            if let response = result.data as? [String: Any],
               let downloadUrl = response["downloadUrl"] as? String,
               let url = URL(string: downloadUrl) {
                return url
            }
            
            errorMessage = "ダウンロードURLの取得に失敗しました"
            return nil
        } catch {
            errorMessage = "アルバムのダウンロードに失敗しました: \(error.localizedDescription)"
            return nil
        }
    }
    
    // MARK: - Real-time Listener
    func listenToPhotos(eventId: String, publishedOnly: Bool = true) {
        listener?.remove()
        
        var query = db.collection("photos")
            .whereField("eventId", isEqualTo: eventId)
        
        if publishedOnly {
            query = query.whereField("isPublished", isEqualTo: true)
        }
        
        listener = query
            .order(by: "uploadedAt", descending: true)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    self.errorMessage = "リアルタイム更新エラー: \(error.localizedDescription)"
                    return
                }
                
                if let snapshot = snapshot {
                    self.photos = snapshot.documents.compactMap { doc in
                        try? doc.data(as: Photo.self)
                    }
                }
            }
    }
    
    func stopListening() {
        listener?.remove()
        listener = nil
    }
    
    deinit {
        listener?.remove()
    }
}

// MARK: - Storage Extension for Progress Tracking
extension StorageReference {
    func putDataAsync(_ uploadData: Data, metadata: StorageMetadata?, onProgress: ((Progress?) -> Void)?) async throws -> StorageMetadata {
        try await withCheckedThrowingContinuation { continuation in
            let uploadTask = self.putData(uploadData, metadata: metadata) { metadata, error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else if let metadata = metadata {
                    continuation.resume(returning: metadata)
                }
            }
            
            uploadTask.observe(.progress) { snapshot in
                onProgress?(snapshot.progress)
            }
        }
    }
}
