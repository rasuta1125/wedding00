//
//  QRCodeView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI
import CoreImage.CIFilterBuiltins

struct QRCodeView: View {
    let event: Event
    @Environment(\.dismiss) var dismiss
    @State private var qrImage: UIImage?
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 30) {
                Text(event.eventName)
                    .font(.title2)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                if let qrImage = qrImage {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 280, height: 280)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(20)
                        .shadow(radius: 5)
                } else {
                    ProgressView()
                        .frame(width: 280, height: 280)
                }
                
                VStack(spacing: 12) {
                    Text("ゲスト招待方法")
                        .font(.headline)
                    
                    Text("ゲストはこのQRコードをスキャンして、イベントに簡単に参加できます。")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    HStack(spacing: 20) {
                        Image(systemName: "camera.viewfinder")
                        Image(systemName: "arrow.right")
                        Image(systemName: "photo.on.rectangle")
                        Image(systemName: "arrow.right")
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    }
                    .font(.title2)
                    .padding()
                }
                
                Spacer()
                
                // Share Button
                if let qrImage = qrImage {
                    ShareLink(
                        item: Image(uiImage: qrImage),
                        preview: SharePreview("QRコード - \(event.eventName)")
                    ) {
                        Label("QRコードを共有", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)
                }
            }
            .padding()
            .navigationTitle("QRコード")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完了") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                generateQRCode()
            }
        }
    }
    
    private func generateQRCode() {
        // Generate guest join URL
        let guestUrl = "https://weddingmoments.app/join/\(event.eventId)?token=\(event.qrToken)"
        
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        
        let data = Data(guestUrl.utf8)
        filter.setValue(data, forKey: "inputMessage")
        filter.setValue("H", forKey: "inputCorrectionLevel")
        
        if let outputImage = filter.outputImage {
            // Scale up the QR code
            let transform = CGAffineTransform(scaleX: 10, y: 10)
            let scaledImage = outputImage.transformed(by: transform)
            
            if let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) {
                qrImage = UIImage(cgImage: cgImage)
            }
        }
    }
}

#Preview {
    QRCodeView(event: .preview)
}
