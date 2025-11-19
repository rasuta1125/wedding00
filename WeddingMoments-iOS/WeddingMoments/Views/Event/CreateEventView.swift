//
//  CreateEventView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct CreateEventView: View {
    @ObservedObject var viewModel: EventViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var eventName = ""
    @State private var eventDate = Date()
    @State private var eventLocation = ""
    @State private var selectedGuestLimit = 100
    @State private var autoPublish = true
    @State private var publishTime = "09:00"
    
    let guestLimits = [25, 50, 100, 175, 250]
    
    var body: some View {
        NavigationStack {
            Form {
                Section("基本情報") {
                    TextField("イベント名", text: $eventName)
                        .placeholder(when: eventName.isEmpty) {
                            Text("山田太郎 & 花子 結婚式").foregroundColor(.gray)
                        }
                    
                    DatePicker("日付", selection: $eventDate, displayedComponents: .date)
                    
                    TextField("場所（任意）", text: $eventLocation)
                }
                
                Section("ゲスト設定") {
                    Picker("ゲスト人数上限", selection: $selectedGuestLimit) {
                        ForEach(guestLimits, id: \.self) { limit in
                            Text("\(limit)名").tag(limit)
                        }
                    }
                }
                
                Section("写真公開設定") {
                    Toggle("翌日自動公開", isOn: $autoPublish)
                    
                    if autoPublish {
                        DatePicker("公開時刻", selection: publishTimeBinding, displayedComponents: .hourAndMinute)
                    }
                }
                
                Section {
                    Text("イベント作成後、QRコードが生成されます。ゲストはQRコードをスキャンしてイベントに参加できます。")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("イベント作成")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("作成") {
                        Task {
                            let success = await viewModel.createEvent(
                                name: eventName,
                                date: eventDate,
                                location: eventLocation.isEmpty ? nil : eventLocation,
                                guestLimit: selectedGuestLimit,
                                autoPublish: autoPublish,
                                publishTime: publishTime
                            )
                            
                            if success {
                                dismiss()
                            }
                        }
                    }
                    .disabled(eventName.isEmpty)
                }
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.2))
                }
            }
        }
    }
    
    private var publishTimeBinding: Binding<Date> {
        Binding(
            get: {
                let components = publishTime.split(separator: ":")
                let hour = Int(components[0]) ?? 9
                let minute = Int(components[1]) ?? 0
                
                var dateComponents = DateComponents()
                dateComponents.hour = hour
                dateComponents.minute = minute
                
                return Calendar.current.date(from: dateComponents) ?? Date()
            },
            set: { newDate in
                let formatter = DateFormatter()
                formatter.dateFormat = "HH:mm"
                publishTime = formatter.string(from: newDate)
            }
        )
    }
}

extension View {
    func placeholder<Content: View>(
        when shouldShow: Bool,
        alignment: Alignment = .leading,
        @ViewBuilder placeholder: () -> Content
    ) -> some View {
        ZStack(alignment: alignment) {
            placeholder().opacity(shouldShow ? 1 : 0)
            self
        }
    }
}

#Preview {
    CreateEventView(viewModel: EventViewModel())
}
