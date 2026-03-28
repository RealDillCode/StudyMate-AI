"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import ChatInterface from "@/components/chat/chat-interface"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  MessageSquarePlus, 
  FileText, 
  ArrowLeft,
  Trash2,
  MessageSquare,
  Upload,
  Download,
  CheckCircle,
  Clock
} from "lucide-react"
import FileUpload from "@/components/materials/file-upload"

interface ClassData {
  id: string
  name: string
  description: string | null
  semester: string | null
  chats: Array<{
    id: string
    name: string
    aiLevel: string
    createdAt: string
  }>
  materials: Array<{
    id: string
    name: string
    type: string
    fileSize: number | null
    processed: boolean
    createdAt: string
  }>
}

export default function ClassDetailClient({ classData }: { classData: ClassData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [chats, setChats] = useState(classData.chats)
  const [selectedChat, setSelectedChat] = useState<string | null>(
    chats.length > 0 ? chats[0].id : null
  )
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [materials, setMaterials] = useState(classData.materials)

  async function createChat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingChat(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const aiLevel = formData.get("aiLevel") as string

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          aiLevel,
          classId: classData.id,
        }),
      })

      if (response.ok) {
        const newChat = await response.json()
        setChats([newChat, ...chats])
        setSelectedChat(newChat.id)
        setDialogOpen(false)
        toast({
          title: "Chat created",
          description: `${name} has been created successfully.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create chat",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsCreatingChat(false)
    }
  }

  async function deleteChat(chatId: string) {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setChats(chats.filter(c => c.id !== chatId))
        if (selectedChat === chatId) {
          setSelectedChat(chats.find(c => c.id !== chatId)?.id || null)
        }
        toast({
          title: "Chat deleted",
          description: "The chat has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete chat",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const selectedChatData = chats.find(c => c.id === selectedChat)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{classData.name}</h1>
              {classData.semester && (
                <p className="text-sm text-muted-foreground">{classData.semester}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chats" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chats">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chats ({chats.length})
            </TabsTrigger>
            <TabsTrigger value="materials">
              <FileText className="mr-2 h-4 w-4" />
              Materials ({classData.materials.length})
            </TabsTrigger>
          </TabsList>

          {/* Chats Tab */}
          <TabsContent value="chats" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
              {/* Chat List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Chats</CardTitle>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <MessageSquarePlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <form onSubmit={createChat}>
                            <DialogHeader>
                              <DialogTitle>Create New Chat</DialogTitle>
                              <DialogDescription>
                                Start a new conversation with your AI assistant
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">Chat Name</Label>
                                <Input
                                  id="name"
                                  name="name"
                                  placeholder="Week 1 Questions"
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="aiLevel">AI Assistance Level</Label>
                                <Select name="aiLevel" defaultValue="study_helper">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="study_helper">Study Helper</SelectItem>
                                    <SelectItem value="guided">Guided Assistant</SelectItem>
                                    <SelectItem value="autonomous">Autonomous Agent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={isCreatingChat}>
                                {isCreatingChat ? "Creating..." : "Create Chat"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    {chats.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No chats yet
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {chats.map((chat) => (
                          <div
                            key={chat.id}
                            className={`group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent cursor-pointer ${
                              selectedChat === chat.id ? "bg-accent" : ""
                            }`}
                            onClick={() => setSelectedChat(chat.id)}
                          >
                            <div className="flex-1 truncate">
                              <p className="text-sm font-medium truncate">
                                {chat.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {chat.aiLevel.replace("_", " ")}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteChat(chat.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-3">
                <Card className="h-[600px]">
                  {selectedChatData ? (
                    <ChatContent
                      chat={selectedChatData}
                      className={classData.name}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">No chat selected</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Create a new chat or select an existing one
                        </p>
                        <Button onClick={() => setDialogOpen(true)}>
                          <MessageSquarePlus className="mr-2 h-4 w-4" />
                          Create First Chat
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Materials</CardTitle>
                    <CardDescription>
                      Upload and manage your textbooks, notes, and assignments
                    </CardDescription>
                  </div>
                  <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Material
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Upload Course Material</DialogTitle>
                        <DialogDescription>
                          Upload a document to make it searchable by the AI assistant
                        </DialogDescription>
                      </DialogHeader>
                      <FileUpload
                        classId={classData.id}
                        onUploadComplete={(material) => {
                          setMaterials([material, ...materials])
                          setUploadDialogOpen(false)
                          toast({
                            title: "Upload successful",
                            description: "Your material is being processed",
                          })
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No materials yet</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Upload your first material to get started
                    </p>
                    <Button onClick={() => setUploadDialogOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload First Material
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{material.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{material.type.toUpperCase()}</span>
                              <span>•</span>
                              <span>{formatFileSize(material.fileSize)}</span>
                              <span>•</span>
                              {material.processed ? (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Processed
                                </span>
                              ) : (
                                <span className="flex items-center text-yellow-600">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Processing...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/materials/${material.id}`, {
                                method: "DELETE",
                              })
                              if (response.ok) {
                                setMaterials(materials.filter(m => m.id !== material.id))
                                toast({
                                  title: "Material deleted",
                                  description: "The material has been removed",
                                })
                              }
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to delete material",
                                variant: "destructive",
                              })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ChatContent({ chat, className }: { chat: any; className: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load messages when chat changes
  useState(() => {
    async function loadMessages() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/chats/${chat.id}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error("Failed to load messages:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMessages()
  }, [chat.id])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2">Loading messages...</div>
        </div>
      </div>
    )
  }

  return (
    <ChatInterface
      chatId={chat.id}
      initialMessages={messages}
      aiLevel={chat.aiLevel}
      className={className}
    />
  )
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "0 B"
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}