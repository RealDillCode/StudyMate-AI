'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Plus, 
  TrendingUp,
  Clock,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { ClassCard } from '@/components/dashboard/class-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { StudyStats } from '@/components/dashboard/study-stats'
import { UpcomingAssignments } from '@/components/dashboard/upcoming-assignments'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - will be replaced with API calls
  const classes = [
    {
      id: '1',
      name: 'Computer Science 101',
      code: 'CS101',
      professor: 'Dr. Smith',
      progress: 65,
      nextAssignment: 'Problem Set 3',
      dueDate: '2024-02-15',
      unreadMessages: 3
    },
    {
      id: '2',
      name: 'Calculus II',
      code: 'MATH202',
      professor: 'Prof. Johnson',
      progress: 45,
      nextAssignment: 'Chapter 5 Exercises',
      dueDate: '2024-02-14',
      unreadMessages: 1
    },
    {
      id: '3',
      name: 'Physics for Engineers',
      code: 'PHYS201',
      professor: 'Dr. Chen',
      progress: 80,
      nextAssignment: 'Lab Report',
      dueDate: '2024-02-16',
      unreadMessages: 0
    }
  ]

  const stats = {
    totalStudyHours: 42,
    weeklyGoal: 50,
    assignmentsCompleted: 12,
    averageGrade: 87,
    aiAssistanceUsed: 28
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">StudyMate Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Hours This Week</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudyHours}h</div>
                  <Progress value={(stats.totalStudyHours / stats.weeklyGoal) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.weeklyGoal - stats.totalStudyHours}h to weekly goal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assignments Completed</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.assignmentsCompleted}</div>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageGrade}%</div>
                  <p className="text-xs text-green-600 mt-1">+3% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Assistance</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.aiAssistanceUsed}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sessions this week</p>
                </CardContent>
              </Card>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Your Classes</h2>
                <div className="grid gap-4">
                  {classes.map((classItem) => (
                    <ClassCard key={classItem.id} class={classItem} />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <UpcomingAssignments />
                <RecentActivity />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{classItem.name}</CardTitle>
                    <CardDescription>{classItem.code} • {classItem.professor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{classItem.progress}%</span>
                        </div>
                        <Progress value={classItem.progress} />
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/class/${classItem.id}/chat`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </Link>
                        <Link href={`/class/${classItem.id}/materials`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Materials
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Class Card */}
              <Card className="border-dashed hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Add New Class</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <UpcomingAssignments expanded />
          </TabsContent>

          <TabsContent value="analytics">
            <StudyStats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}