'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface FilePreviewProps {
  files: File[]
  onRemove: (index: number) => void
}

export default function FilePreview({ files, onRemove }: FilePreviewProps) {
  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.includes('image')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (files.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center flex-1 min-w-0">
            <span className="text-2xl mr-3">{getFileIcon(file)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  )
}

