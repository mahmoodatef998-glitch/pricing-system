'use client'

interface FileUploadProgressProps {
  progress: number
  fileName?: string
}

export default function FileUploadProgress({ progress, fileName }: FileUploadProgressProps) {
  if (progress === 0 || progress === 100) return null

  return (
    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      {fileName && (
        <p className="text-sm font-medium text-blue-900 mb-2 truncate">{fileName}</p>
      )}
      <div className="w-full bg-blue-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-blue-700 mt-2 text-right">{Math.round(progress)}%</p>
    </div>
  )
}

