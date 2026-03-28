"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, BookOpen, MessageSquare, Trash2, BarChart3, Video, PenTool } from "lucide-react"
import StudyDashboard from "@/components/progress/study-dashboard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Class {
  id: string
  name: string
  description: string | null
  semester: string | null
  createdAt: string
}

export default function DashboardClient({ initialClasses }: { initialClasses: Class[] }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [classes, setClasses] = useState(initialClasses)
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function createClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const semester = formData.get("semester") as string

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          semester,
        }),
      })

      if (response.ok) {
        const newClass = await response.json()
        setClasses([newClass, ...classes])
        setDialogOpen(false)
        toast({
          title: "Class created",
          description: `${name} has been created successfully.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create class",
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
      setIsCreating(false)
    }
  }

  async function deleteClass(classId: string) {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setClasses(classes.filter(c => c.id !== classId))
        toast({
          title: "Class deleted",
          description: "The class has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete class",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Study Progress Dashboard */}
        <div className="mb-8">
          <StudyDashboard userId={session?.user?.id || ""} />
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Classes</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || session?.user?.email}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={createClass}>
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Add a new class to start organizing your study materials
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="CS 101: Introduction to Computer Science"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Brief description of the class"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="semester">Semester (Optional)</Label>
                    <Input
                      id="semester"
                      name="semester"
                      placeholder="Fall 2024"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Class"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No classes yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first class to get started
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">
                        {classItem.name}
                      </CardTitle>
                      {classItem.semester && (
                        <p className="text-sm text-muted-foreground">
                          {classItem.semester}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteClass(classItem.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {classItem.description && (
                    <CardDescription className="mb-4 line-clamp-2">
                      {classItem.description}
                    </CardDescription>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/dashboard/class/${classItem.id}`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Class
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}