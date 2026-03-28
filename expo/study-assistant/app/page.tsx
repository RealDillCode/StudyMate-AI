import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Brain, Upload, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6" />
            <span className="text-xl font-bold">Study Assistant</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              Your AI-Powered Study Companion
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Organize your classes, upload materials, and get personalized AI assistance
              for every subject. Choose your level of help - from study guidance to
              comprehensive homework support.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/signup">
                <Button size="lg">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border-t bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Everything You Need to Succeed
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Class Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Create separate AI chats for each of your classes
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Material Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Upload textbooks, notes, and assignments for context
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Adaptive AI Help</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your assistance level from study help to full autonomy
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  AI remembers your progress and adapts to your learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Study Assistant. Built for students, by students.
        </div>
      </footer>
    </div>
  )
}