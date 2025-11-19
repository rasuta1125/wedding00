'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '200px', // Load images 200px before they enter viewport
      }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Generate blur data URL if not provided
  const defaultBlurDataURL = 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {!isInView ? (
        // Placeholder while not in view
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={!fill && width && height ? { width, height } : undefined}
        />
      ) : (
        <>
          <Image
            src={src}
            alt={alt}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            fill={fill}
            sizes={sizes}
            quality={quality}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL || defaultBlurDataURL}
            onLoad={handleLoad}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${fill ? 'object-cover' : ''}`}
          />
          
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </>
      )}
    </div>
  )
}

// Blur hash generator (optional, requires blurhash library)
export function generateBlurDataURL(width: number = 8, height: number = 8): string {
  // Simple gray blur placeholder
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`
  ).toString('base64')}`
}

// Progressive image loading component
export function ProgressiveImage({
  lowQualitySrc,
  highQualitySrc,
  alt,
  className = '',
  src: _src,
  ...props
}: LazyImageProps & { lowQualitySrc?: string; highQualitySrc?: string }) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || '')
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false)

  useEffect(() => {
    if (!highQualitySrc) return

    const img = new window.Image()
    img.src = highQualitySrc
    img.onload = () => {
      setCurrentSrc(highQualitySrc)
      setIsHighQualityLoaded(true)
    }
  }, [highQualitySrc])

  return (
    <LazyImage
      src={currentSrc || highQualitySrc || ''}
      alt={alt}
      className={`${className} ${!isHighQualityLoaded ? 'blur-sm' : ''} transition-all duration-300`}
      {...props}
    />
  )
}
