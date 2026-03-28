"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Brain,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Sparkles,
  BookOpen,
  Edit,
  Trash2,
  Download,
  Upload
} from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  classId: string
  difficulty: number // 1-5
  lastReviewed?: Date
  nextReview?: Date
  reviewCount: number
  correctCount: number
  tags: string[]
}

interface StudySession {
  cards: Flashcard[]
  currentIndex: number
  showAnswer: boolean
  sessionStats: {
    correct: number
    incorrect: number
    skipped: number
  }
}

export default function FlashcardSystem({ classId }: { classId: string }) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [studySession, setStudySession] = useState<StudySession | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newCard, setNewCard] = useState({ front: "", back: "", tags: "" })
  const [aiGenerating, setAiGenerating] = useState(false)
  const { toast } = useToast()

  // Spaced repetition algorithm (SM-2)
  const calculateNextReview = (
    difficulty: number,
    reviewCount: number,
    wasCorrect: boolean
  ): Date => {
    let interval = 1 // Default 1 day
    
    if (wasCorrect) {
      if (reviewCount === 0) interval = 1
      else if (reviewCount === 1) interval = 3
      else if (reviewCount === 2) interval = 7
      else if (reviewCount === 3) interval = 14
      else if (reviewCount === 4) interval = 30
      else interval = Math.round(30 * Math.pow(2.5, reviewCount - 4))
      
      // Adjust based on difficulty
      interval = Math.round(interval * (1.3 - difficulty * 0.1))
    } else {
      interval = 1 // Reset to 1 day if incorrect
    }
    
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + interval)
    return nextDate
  }

  // Start study session with due cards
  const startStudySession = () => {
    const now = new Date()
    const dueCards = flashcards.filter(card => 
      !card.nextReview || new Date(card.nextReview) <= now
    )
    
    if (dueCards.length === 0) {
      toast({
        title: "No cards due",
        description: "All cards have been reviewed. Check back later!",
      })
      return
    }
    
    setStudySession({
      cards: dueCards,
      currentIndex: 0,
      showAnswer: false,
      sessionStats: {
        correct: 0,
        incorrect: 0,
        skipped: 0,
      },
    })
  }

  // Handle card review
  const reviewCard = async (difficulty: "easy" | "medium" | "hard") => {
    if (!studySession) return
    
    const currentCard = studySession.cards[studySession.currentIndex]
    const wasCorrect = difficulty !== "hard"
    const difficultyValue = difficulty === "easy" ? 1 : difficulty === "medium" ? 3 : 5
    
    // Update card statistics
    const updatedCard = {
      ...currentCard,
      difficulty: difficultyValue,
      lastReviewed: new Date(),
      nextReview: calculateNextReview(
        difficultyValue,
        currentCard.reviewCount,
        wasCorrect
      ),
      reviewCount: currentCard.reviewCount + 1,
      correctCount: wasCorrect ? currentCard.correctCount + 1 : currentCard.correctCount,
    }
    
    // Update in database
    try {
      await fetch(`/api/flashcards/${currentCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCard),
      })
      
      // Update local state
      setFlashcards(prev => 
        prev.map(card => card.id === currentCard.id ? updatedCard : card)
      )
      
      // Update session stats
      setStudySession(prev => {
        if (!prev) return null
        
        const newStats = { ...prev.sessionStats }
        if (wasCorrect) newStats.correct++
        else newStats.incorrect++
        
        // Move to next card or end session
        if (prev.currentIndex < prev.cards.length - 1) {
          return {
            ...prev,
            currentIndex: prev.currentIndex + 1,
            showAnswer: false,
            sessionStats: newStats,
          }
        } else {
          // Session complete
          toast({
            title: "Session complete!",
            description: `Correct: ${newStats.correct}, Incorrect: ${newStats.incorrect}`,
          })
          return null
        }
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card",
        variant: "destructive",
      })
    }
  }

  // Create new flashcard
  const createFlashcard = async () => {
    if (!newCard.front || !newCard.back) {
      toast({
        title: "Missing information",
        description: "Please fill in both front and back of the card",
        variant: "destructive",
      })
      return
    }
    
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCard,
          classId,
          tags: newCard.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      })
      
      if (response.ok) {
        const card = await response.json()
        setFlashcards([...flashcards, card])
        setNewCard({ front: "", back: "", tags: "" })
        setIsCreating(false)
        toast({
          title: "Card created",
          description: "New flashcard added to your deck",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create flashcard",
        variant: "destructive",
      })
    }
  }

  // Generate flashcards with AI
  const generateWithAI = async () => {
    setAiGenerating(true)
    
    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          topic: "recent materials", // Could be more specific
          count: 10,
        }),
      })
      
      if (response.ok) {
        const { cards } = await response.json()
        setFlashcards([...flashcards, ...cards])
        toast({
          title: "Cards generated",
          description: `${cards.length} flashcards created from your materials`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate flashcards",
        variant: "destructive",
      })
    } finally {
      setAiGenerating(false)
    }
  }

  // Export flashcards
  const exportFlashcards = () => {
    const data = JSON.stringify(flashcards, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "flashcards.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Flashcards</CardTitle>
              <CardDescription>
                Study with spaced repetition for better retention
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateWithAI}
                disabled={aiGenerating}
              >
                {aiGenerating ? (
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate with AI
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{flashcards.length}</p>
              <p className="text-sm text-muted-foreground">Total Cards</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {flashcards.filter(c => 
                  !c.nextReview || new Date(c.nextReview) <= new Date()
                ).length}
              </p>
              <p className="text-sm text-muted-foreground">Due Now</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {flashcards.filter(c => c.reviewCount > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Learned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {flashcards.length > 0 
                  ? Math.round(
                      flashcards.reduce((acc, c) => 
                        acc + (c.correctCount / Math.max(c.reviewCount, 1)), 0
                      ) / flashcards.length * 100
                    )
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>

          {/* Study Session or Card Management */}
          {studySession ? (
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Card {studySession.currentIndex + 1} of {studySession.cards.length}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudySession(null)}
                  >
                    End Session
                  </Button>
                </div>
                <Progress 
                  value={(studySession.currentIndex / studySession.cards.length) * 100} 
                />
              </CardHeader>
              <CardContent>
                <div className="min-h-[200px] flex items-center justify-center p-8">
                  {!studySession.showAnswer ? (
                    <div className="text-center">
                      <p className="text-xl font-medium">
                        {studySession.cards[studySession.currentIndex].front}
                      </p>
                      <Button
                        className="mt-8"
                        onClick={() => setStudySession({
                          ...studySession,
                          showAnswer: true,
                        })}
                      >
                        Show Answer
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Question:</p>
                        <p className="text-lg">{studySession.cards[studySession.currentIndex].front}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Answer:</p>
                        <p className="text-xl font-medium text-primary">
                          {studySession.cards[studySession.currentIndex].back}
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => reviewCard("hard")}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Hard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => reviewCard("medium")}
                        >
                          <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                          Medium
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => reviewCard("easy")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                          Easy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8">
              {flashcards.length === 0 ? (
                <>
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No flashcards yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create flashcards manually or generate them from your materials
                  </p>
                </>
              ) : (
                <>
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to study?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have {flashcards.filter(c => 
                      !c.nextReview || new Date(c.nextReview) <= new Date()
                    ).length} cards due for review
                  </p>
                  <Button onClick={startStudySession} size="lg">
                    <Brain className="mr-2 h-4 w-4" />
                    Start Study Session
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Card Dialog */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Flashcard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Front (Question)</label>
              <Textarea
                placeholder="What is the capital of France?"
                value={newCard.front}
                onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Back (Answer)</label>
              <Textarea
                placeholder="Paris"
                value={newCard.back}
                onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                placeholder="geography, capitals, europe"
                value={newCard.tags}
                onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={createFlashcard}>
                Create Card
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}