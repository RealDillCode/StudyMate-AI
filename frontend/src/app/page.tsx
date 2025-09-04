'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Brain, FileText, GraduationCap, MessageSquare, TrendingUp, Video, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Class-Based Organization",
      description: "Separate AI assistant for each of your classes with context-aware conversations"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Adjustable AI Assistance",
      description: "Choose from study help to autonomous homework completion based on your needs"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Material Management",
      description: "Upload textbooks, notes, and assignments for intelligent content retrieval"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Screen Recording Analysis",
      description: "Upload homework instruction videos for automatic processing and task extraction"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Writing Style Mimicry",
      description: "AI learns and perfectly replicates your unique writing style"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Monitor your learning progress and identify knowledge gaps"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">StudyMate AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your AI-Powered Study Companion
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transform your college experience with personalized AI assistance for every class. 
            From homework help to autonomous completion, StudyMate AI adapts to your learning style.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/register')}>
              Start Free Trial
              <Zap className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/demo')}>
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Excel
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of students already using StudyMate AI to ace their classes
            </p>
            <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
              Get Started for Free
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">StudyMate AI</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}