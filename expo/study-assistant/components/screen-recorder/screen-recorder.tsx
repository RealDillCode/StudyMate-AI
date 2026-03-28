"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { 
  Video, 
  Circle, 
  Square, 
  Play, 
  Pause,
  Download,
  Upload,
  Mic,
  MicOff,
  Monitor,
  Loader2,
  AlertCircle
} from "lucide-react"

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  blob: Blob | null
}

export default function ScreenRecorder({ 
  classId, 
  onUploadComplete 
}: { 
  classId: string
  onUploadComplete?: (videoId: string) => void 
}) {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    blob: null,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [preview, setPreview] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      // Request screen capture with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          logicalSurface: true,
          cursor: "always"
        },
        audio: audioEnabled
      })

      // Optional: Add microphone audio
      if (audioEnabled) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true 
          })
          
          // Combine streams
          const combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
          ])
          
          streamRef.current = combinedStream
        } catch (err) {
          // Continue with just screen audio
          streamRef.current = displayStream
        }
      } else {
        streamRef.current = displayStream
      }

      // Create media recorder
      const mediaRecorder = new MediaRecorder(streamRef.current!, {
        mimeType: 'video/webm;codecs=vp8,opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordingState(prev => ({ ...prev, blob, isRecording: false }))
        
        // Create preview
        const url = URL.createObjectURL(blob)
        setPreview(url)
        
        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop())
      }

      // Handle stream end (user stops sharing)
      streamRef.current.getVideoTracks()[0].onended = () => {
        stopRecording()
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: true,
        duration: 0 
      }))

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingState(prev => ({ 
          ...prev, 
          duration: prev.duration + 1 
        }))
      }, 1000)

      toast({
        title: "Recording started",
        description: "Your screen is being recorded",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Recording failed",
        description: "Could not start screen recording. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState(prev => ({ ...prev, isPaused: true }))
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState(prev => ({ ...prev, isPaused: false }))
    }
  }

  const uploadRecording = async () => {
    if (!recordingState.blob) return

    setIsProcessing(true)
    const formData = new FormData()
    formData.append('video', recordingState.blob, 'recording.webm')
    formData.append('classId', classId)
    formData.append('duration', recordingState.duration.toString())

    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Upload successful",
          description: "Your recording is being processed",
        })
        
        if (onUploadComplete) {
          onUploadComplete(data.videoId)
        }
        
        // Reset state
        setRecordingState({
          isRecording: false,
          isPaused: false,
          duration: 0,
          blob: null,
        })
        setPreview(null)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload recording. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadRecording = () => {
    if (!recordingState.blob) return

    const url = URL.createObjectURL(recordingState.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recording-${Date.now()}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Screen Recorder</CardTitle>
        <CardDescription>
          Record your screen to capture homework instructions or tutorials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recordingState.isRecording && !preview && (
          <div className="text-center py-8">
            <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Record</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share your screen to capture assignment instructions
            </p>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Audio On
                  </>
                ) : (
                  <>
                    <MicOff className="mr-2 h-4 w-4" />
                    Audio Off
                  </>
                )}
              </Button>
            </div>
            
            <Button onClick={startRecording} size="lg">
              <Circle className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
              Start Recording
            </Button>
          </div>
        )}

        {recordingState.isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Circle className="h-6 w-6 fill-red-500 text-red-500 animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold">Recording in Progress</p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {formatDuration(recordingState.duration)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {recordingState.isPaused ? (
                  <Button onClick={resumeRecording} variant="outline" size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} variant="outline" size="sm">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={stopRecording} variant="destructive" size="sm">
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </div>
            </div>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                src={preview} 
                controls 
                className="w-full h-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Recording Complete</p>
                <p className="text-xs text-muted-foreground">
                  Duration: {formatDuration(recordingState.duration)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={downloadRecording} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  onClick={uploadRecording} 
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Process
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Recording Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Make sure to show all relevant assignment instructions</li>
                <li>Speak clearly if recording audio explanations</li>
                <li>Recordings are processed to extract text and key information</li>
                <li>Maximum recording duration: 30 minutes</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}