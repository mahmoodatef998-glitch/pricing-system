'use client'

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

interface ImagePreviewProps {
  files: File[]
  onRemove: (index: number) => void
}

export default function ImagePreview({ files, onRemove }: ImagePreviewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length === 0) return null

  return (
    <>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
        {imageFiles.map((file, index) => {
          const originalIndex = files.indexOf(file)
          const imageUrl = URL.createObjectURL(file)
          
          return (
            <div
              key={index}
              className="relative group bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={imageUrl}
                alt={file.name}
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() => setSelectedImage(imageUrl)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedImage(imageUrl)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-all"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(imageUrl)
                  onRemove(originalIndex)
                }}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Full Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => {
            setSelectedImage(null)
          }}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

