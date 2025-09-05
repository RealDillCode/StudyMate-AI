"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Timer,
  Zap
} from "lucide-react"

interface StudyStats {
  totalStudyTime: number // minutes
  sessionsCompleted: number
  averageSessionLength: number
  streak: number
  topicsCompleted: number
  questionsAsked: number
  assignmentsCompleted: number
  accuracy: number
}

interface StudyGoal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export default function StudyDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<StudyStats>({
    totalStudyTime: 1250,
    sessionsCompleted: 42,
    averageSessionLength: 30,
    streak: 7,
    topicsCompleted: 15,
    questionsAsked: 238,
    assignmentsCompleted: 8,
    accuracy: 85,
  })

  const [goals, setGoals] = useState<StudyGoal[]>([
    {
      id: "1",
      title: "Daily Study Time",
      target: 120,
      current: 85,
      unit: "minutes",
    },
    {
      id: "2",
      title: "Weekly Assignments",
      target: 5,
      current: 3,
      unit: "assignments",
      deadline: "Sunday",
    },
    {
      id: "3",
      title: "Practice Problems",
      target: 20,
      current: 12,
      unit: "problems",
    },
  ])

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "Early Bird",
      description: "Complete 5 study sessions before 9 AM",
      icon: "🌅",
      unlocked: true,
      unlockedAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Consistency King",
      description: "Maintain a 7-day study streak",
      icon: "👑",
      unlocked: true,
      unlockedAt: "2024-01-20",
    },
    {
      id: "3",
      title: "Question Master",
      description: "Ask 100 questions to the AI",
      icon: "❓",
      unlocked: true,
      unlockedAt: "2024-01-18",
    },
    {
      id: "4",
      title: "Perfect Week",
      description: "Complete all weekly goals",
      icon: "⭐",
      unlocked: false,
    },
  ])

  const [activeSession, setActiveSession] = useState<{
    startTime: Date | null
    duration: number
    classId?: string
  }>({
    startTime: null,
    duration: 0,
  })

  // Start study session
  const startSession = (classId?: string) => {
    setActiveSession({
      startTime: new Date(),
      duration: 0,
      classId,
    })

    // Start timer
    const timer = setInterval(() => {
      setActiveSession(prev => ({
        ...prev,
        duration: prev.duration + 1,
      }))
    }, 60000) // Update every minute

    // Store timer ID for cleanup
    sessionStorage.setItem('studyTimer', timer.toString())
  }

  // End study session
  const endSession = async () => {
    if (!activeSession.startTime) return

    const sessionData = {
      startTime: activeSession.startTime,
      endTime: new Date(),
      duration: activeSession.duration,
      classId: activeSession.classId,
    }

    // Save session to database
    try {
      await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      })

      // Update stats
      setStats(prev => ({
        ...prev,
        totalStudyTime: prev.totalStudyTime + activeSession.duration,
        sessionsCompleted: prev.sessionsCompleted + 1,
      }))

      // Reset session
      setActiveSession({
        startTime: null,
        duration: 0,
      })

      // Clear timer
      const timerId = sessionStorage.getItem('studyTimer')
      if (timerId) {
        clearInterval(parseInt(timerId))
        sessionStorage.removeItem('studyTimer')
      }
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Study Timer */}
      {activeSession.startTime ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-primary animate-pulse" />
                <CardTitle>Study Session Active</CardTitle>
              </div>
              <Button onClick={endSession} variant="destructive" size="sm">
                End Session
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatDuration(activeSession.duration)}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Start Study Session</CardTitle>
            <CardDescription>
              Track your study time and build your streak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => startSession()} className="w-full">
              <Clock className="mr-2 h-4 w-4" />
              Start Studying
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.totalStudyTime)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatDuration(85)} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up! 🔥
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.questionsAsked}</div>
            <p className="text-xs text-muted-foreground">
              +12 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600" /> +5% this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Achievements */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="goals">
            <Target className="mr-2 h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="mr-2 h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          {goals.map(goal => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{goal.title}</CardTitle>
                  {goal.deadline && (
                    <span className="text-sm text-muted-foreground">
                      Due {goal.deadline}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{goal.current} / {goal.target} {goal.unit}</span>
                    <span className="font-medium">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" className="w-full">
            <Target className="mr-2 h-4 w-4" />
            Set New Goal
          </Button>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map(achievement => (
              <Card 
                key={achievement.id}
                className={achievement.unlocked ? '' : 'opacity-50'}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <CardTitle className="text-base">
                        {achievement.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {achievement.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {achievement.unlocked && (
                  <CardContent>
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Unlocked {achievement.unlockedAt}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Patterns</CardTitle>
              <CardDescription>
                Your study habits over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Weekly chart would go here */}
                <div className="h-[200px] flex items-center justify-center border rounded-lg">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Chart visualization coming soon
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium">Best Study Time</p>
                    <p className="text-2xl font-bold">2-4 PM</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Most Productive Day</p>
                    <p className="text-2xl font-bold">Wednesday</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Focus Score</p>
                    <p className="text-2xl font-bold">8.5/10</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}