"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Download
} from "lucide-react"

interface WritingStyleProfile {
  id: string
  name: string
  samplesCount: number
  accuracy: number
  createdAt: string
  style?: any
}

export default function StyleTrainer({ userId }: { userId: string }) {
  const [samples, setSamples] = useState<string[]>([])
  const [currentSample, setCurrentSample] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [profile, setProfile] = useState<WritingStyleProfile | null>(null)
  const [testMode, setTestMode] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const { toast } = useToast()

  const addSample = () => {
    if (currentSample.length < 500) {
      toast({
        title: "Sample too short",
        description: "Please provide at least 500 characters for accurate analysis",
        variant: "destructive",
      })
      return
    }

    setSamples([...samples, currentSample])
    setCurrentSample("")
    toast({
      title: "Sample added",
      description: `${samples.length + 1} samples collected`,
    })
  }

  const analyzeStyle = async () => {
    if (samples.length < 3) {
      toast({
        title: "More samples needed",
        description: "Please provide at least 3 writing samples for accurate analysis",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/writing-style/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          samples,
          name: "My Writing Style",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        toast({
          title: "Analysis complete",
          description: "Your writing style has been analyzed and saved",
        })
      } else {
        throw new Error("Analysis failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze writing style",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const testStyle = async () => {
    if (!profile) return

    setTestMode(true)
    try {
      const response = await fetch("/api/writing-style/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: profile.id,
          prompt: "Write a paragraph about the importance of education",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedText(data.text)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate text",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Writing Style Trainer</CardTitle>
          <CardDescription>
            Train the AI to write in your unique style by providing writing samples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="collect">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collect">
                <FileText className="mr-2 h-4 w-4" />
                Collect Samples
              </TabsTrigger>
              <TabsTrigger value="analyze" disabled={samples.length < 3}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyze Style
              </TabsTrigger>
              <TabsTrigger value="test" disabled={!profile}>
                <Sparkles className="mr-2 h-4 w-4" />
                Test Style
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collect" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Writing Sample {samples.length + 1}
                </label>
                <Textarea
                  placeholder="Paste a sample of your writing here (essays, emails, assignments)..."
                  value={currentSample}
                  onChange={(e) => setCurrentSample(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {currentSample.length} characters
                  </span>
                  <Button onClick={addSample} disabled={currentSample.length < 500}>
                    Add Sample
                  </Button>
                </div>
              </div>

              {samples.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Collected Samples</h4>
                  <div className="space-y-2">
                    {samples.map((sample, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            Sample {index + 1} ({sample.length} characters)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSamples(samples.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tips for best results:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Provide at least 3-5 samples of your writing</li>
                      <li>Use samples from different contexts (formal, casual)</li>
                      <li>Each sample should be at least 500 characters</li>
                      <li>Include your typical vocabulary and sentence structure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analyze" className="space-y-4">
              {!profile ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have {samples.length} samples ready for analysis
                  </p>
                  <Button onClick={analyzeStyle} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze Writing Style
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Vocabulary Complexity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {profile.style?.vocabularyComplexity || 0}/10
                        </div>
                        <Progress 
                          value={(profile.style?.vocabularyComplexity || 0) * 10} 
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Formality Level</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {profile.style?.formality || 0}/10
                        </div>
                        <Progress 
                          value={(profile.style?.formality || 0) * 10} 
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Avg Sentence Length</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {profile.style?.averageSentenceLength?.toFixed(0) || 0} words
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Emotional Tone</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold capitalize">
                          {profile.style?.emotionalTone || "neutral"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Common Phrases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.style?.uniquePhrases?.map((phrase: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-full bg-secondary px-3 py-1 text-xs"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Test Your Writing Style</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate text in your writing style to see how well the AI has learned
                  </p>
                  <Button onClick={testStyle}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Sample Text
                  </Button>
                </div>

                {generatedText && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Generated in Your Style</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p>{generatedText}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export Style Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}