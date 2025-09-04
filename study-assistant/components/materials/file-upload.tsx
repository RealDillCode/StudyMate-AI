"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"

interface FileUploadProps {
  classId: string
  onUploadComplete?: (material: any) => void
  maxFileSize?: number
}

export default function FileUpload({ 
  classId, 
  onUploadComplete,
  maxFileSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxFileSize / (1024 * 1024)}MB`,
          variant: "destructive",
        })
        return
      }
      
      setSelectedFile(file)
    }
  }, [maxFileSize, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("classId", classId)

    try {
      // Simulate progress (in production, use XMLHttpRequest for real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Upload failed")
      }

      const data = await response.json()
      
      toast({
        title: "Upload successful",
        description: "Your file is being processed. This may take a moment.",
      })

      if (onUploadComplete) {
        onUploadComplete(data.material)
      }

      // Reset state
      setTimeout(() => {
        setSelectedFile(null)
        setUploadProgress(0)
      }, 1000)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 hover:border-gray-400"
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm font-medium mb-1">
            {isDragActive 
              ? "Drop your file here" 
              : "Drag & drop a file here, or click to select"
            }
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: PDF, TXT, MD, DOC, DOCX, JPG, PNG (Max {maxFileSize / (1024 * 1024)}MB)
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-8 w-8 text-blue-500 mt-1" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {uploading && (
            <div className="space-y-2 mb-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {uploadProgress === 100 && (
            <div className="flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <span className="text-sm">Upload complete! Processing...</span>
            </div>
          )}

          {!uploading && uploadProgress === 0 && (
            <Button 
              onClick={uploadFile} 
              className="w-full"
              disabled={!selectedFile}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Processing Information</p>
            <p className="text-xs">
              After upload, your document will be processed to extract text and create searchable chunks. 
              The AI will be able to reference this material when answering questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}