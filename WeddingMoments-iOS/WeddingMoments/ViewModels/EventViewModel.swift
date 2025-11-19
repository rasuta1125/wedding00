//
//  EventViewModel.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import FirebaseFirestore
import FirebaseAuth
import FirebaseFunctions
import Combine

@MainActor
class EventViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var currentEvent: Event?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let db = Firestore.firestore()
    private let functions = Functions.functions()
    private var listener: ListenerRegistration?
    
    // MARK: - Fetch Events
    func fetchEvents() async {
        isLoading = true
        defer { isLoading = false }
        
        guard let userId = Auth.auth().currentUser?.uid else {
            errorMessage = "認証が必要です"
            return
        }
        
        do {
            let snapshot = try await db.collection("events")
                .whereField("hostUserId", isEqualTo: userId)
                .order(by: "eventDate", descending: true)
                .getDocuments()
            
            events = snapshot.documents.compactMap { doc in
                try? doc.data(as: Event.self)
            }
        } catch {
            errorMessage = "イベントの取得に失敗しました: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Create Event
    func createEvent(
        name: String,
        date: Date,
        location: String?,
        guestLimit: Int,
        autoPublish: Bool = true,
        publishTime: String = "09:00"
    ) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        guard let userId = Auth.auth().currentUser?.uid else {
            errorMessage = "認証が必要です"
            return false
        }
        
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withFullDate]
        
        let data: [String: Any] = [
            "eventName": name,
            "eventDate": dateFormatter.string(from: date),
            "eventLocation": location ?? "",
            "guestLimit": guestLimit,
            "autoPublish": autoPublish,
            "publishTime": publishTime
        ]
        
        do {
            let result = try await functions.httpsCallable("createEvent").call(data)
            
            if let response = result.data as? [String: Any],
               let success = response["success"] as? Bool, success {
                await fetchEvents()
                return true
            } else {
                errorMessage = "イベント作成に失敗しました"
                return false
            }
        } catch {
            errorMessage = "イベント作成に失敗しました: \(error.localizedDescription)"
            return false
        }
    }
    
    // MARK: - Update Event
    func updateEvent(_ event: Event) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            try await db.collection("events").document(event.eventId).updateData([
                "eventName": event.eventName,
                "eventLocation": event.eventLocation ?? "",
                "settings": [
                    "allowGuestDownload": event.settings.allowGuestDownload,
                    "watermark": event.settings.watermark,
                    "compressionQuality": event.settings.compressionQuality
                ],
                "updatedAt": FieldValue.serverTimestamp()
            ])
            await fetchEvents()
            return true
        } catch {
            errorMessage = "イベントの更新に失敗しました: \(error.localizedDescription)"
            return false
        }
    }
    
    // MARK: - Delete Event
    func deleteEvent(_ event: Event) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            // 論理削除
            try await db.collection("events").document(event.eventId).updateData([
                "status": "archived",
                "updatedAt": FieldValue.serverTimestamp()
            ])
            await fetchEvents()
            return true
        } catch {
            errorMessage = "イベントの削除に失敗しました: \(error.localizedDescription)"
            return false
        }
    }
    
    // MARK: - Publish Photos
    func publishPhotos(for eventId: String) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let result = try await functions.httpsCallable("publishPhotos").call(["eventId": eventId])
            
            if let response = result.data as? [String: Any],
               let success = response["success"] as? Bool, success {
                await fetchEvents()
                return true
            } else {
                errorMessage = "写真の公開に失敗しました"
                return false
            }
        } catch {
            errorMessage = "写真の公開に失敗しました: \(error.localizedDescription)"
            return false
        }
    }
    
    // MARK: - Real-time Listener
    func listenToEvent(eventId: String) {
        listener?.remove()
        listener = db.collection("events").document(eventId)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    self.errorMessage = "リアルタイム更新エラー: \(error.localizedDescription)"
                    return
                }
                
                if let snapshot = snapshot {
                    self.currentEvent = try? snapshot.data(as: Event.self)
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
