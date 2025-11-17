'use client'

import React, { useCallback, useState } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn, formatFileSize } from '@/lib/utils'
import { uploadDocument, DocumentUploadResponse } from '@/lib/api'

interface FileUploadProps {
  onUploadComplete: (result: DocumentUploadResponse) => void
  onUploadStart?: () => void
  className?: string
}

interface UploadState {
  file: File | null
  uploading: boolean
  progress: number
  error: string | null
  success: boolean
}

export function FileUpload({ onUploadComplete, onUploadStart, className }: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select a PDF, PPTX, or TXT file',
        file: null
      }))
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setUploadState(prev => ({
        ...prev,
        error: 'File size must be less than 50MB',
        file: null
      }))
      return
    }

    setUploadState(prev => ({
      ...prev,
      file,
      error: null,
      success: false
    }))
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!uploadState.file) return

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null
    }))

    onUploadStart?.()

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 200)

      const result = await uploadDocument(uploadState.file)

      clearInterval(progressInterval)
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        success: true
      }))

      setTimeout(() => {
        onUploadComplete(result)
      }, 500)

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      }))
    }
  }

  const handleRemoveFile = () => {
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄'
    if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return '📊'
    if (file.type === 'text/plain') return '📝'
    return '📄'
  }

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardContent className="p-6">
        {!uploadState.file ? (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload your document</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your PDF, PPTX, or TXT file here, or click to browse
            </p>
            <Button variant="outline">
              <File className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.pptx,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: PDF, PPTX, TXT (max 50MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileIcon(uploadState.file)}</span>
                <div>
                  <p className="font-medium">{uploadState.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadState.file.size)}
                  </p>
                </div>
              </div>
              {!uploadState.uploading && !uploadState.success && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {uploadState.success && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>

            {uploadState.uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadState.progress}%</span>
                </div>
                <Progress value={uploadState.progress} />
              </div>
            )}

            {uploadState.error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{uploadState.error}</span>
              </div>
            )}

            {uploadState.success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">File uploaded successfully!</span>
              </div>
            )}

            {!uploadState.uploading && !uploadState.success && !uploadState.error && (
              <div className="flex space-x-2">
                <Button onClick={handleUpload} className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Process
                </Button>
                <Button variant="outline" onClick={handleRemoveFile}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}