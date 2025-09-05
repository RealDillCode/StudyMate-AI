import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Writing style features to analyze
export interface WritingStyle {
  // Vocabulary
  averageWordLength: number
  vocabularyComplexity: number // 1-10 scale
  commonWords: string[]
  uniquePhrases: string[]
  
  // Sentence structure
  averageSentenceLength: number
  sentenceVariation: number // Standard deviation
  sentenceStarters: string[]
  
  // Paragraph structure
  averageParagraphLength: number
  paragraphTransitions: string[]
  
  // Tone and style
  formality: number // 1-10 scale
  emotionalTone: string // positive, neutral, negative, academic
  activeVsPassive: number // ratio
  
  // Punctuation patterns
  punctuationFrequency: {
    commas: number
    semicolons: number
    dashes: number
    exclamations: number
    questions: number
  }
  
  // Common patterns
  idioms: string[]
  contractionUsage: number // frequency
  citationStyle: string // APA, MLA, Chicago, etc.
}

// Analyze a text sample to extract writing style
export function analyzeWritingStyle(text: string): WritingStyle {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.toLowerCase().split(/\s+/)
  const paragraphs = text.split(/\n\n+/)
  
  // Calculate vocabulary metrics
  const wordLengths = words.map(w => w.length)
  const averageWordLength = wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length
  
  // Word frequency analysis
  const wordFreq: Record<string, number> = {}
  words.forEach(word => {
    const cleaned = word.replace(/[^a-z]/g, '')
    if (cleaned) wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1
  })
  
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
  
  // Sentence analysis
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length)
  const averageSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
  const sentenceVariation = calculateStandardDeviation(sentenceLengths)
  
  // Extract sentence starters
  const sentenceStarters = sentences
    .slice(0, 20)
    .map(s => {
      const words = s.trim().split(/\s+/)
      return words.slice(0, Math.min(3, words.length)).join(' ')
    })
    .filter((s, i, arr) => arr.indexOf(s) === i) // unique
  
  // Paragraph analysis
  const paragraphLengths = paragraphs.map(p => p.split(/\s+/).length)
  const averageParagraphLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length
  
  // Find transition words
  const transitions = findTransitionWords(text)
  
  // Analyze formality
  const formality = calculateFormality(text)
  
  // Detect emotional tone
  const emotionalTone = detectEmotionalTone(text)
  
  // Active vs passive voice ratio
  const activeVsPassive = calculateActivePassiveRatio(text)
  
  // Punctuation analysis
  const punctuationFrequency = {
    commas: (text.match(/,/g) || []).length / sentences.length,
    semicolons: (text.match(/;/g) || []).length / sentences.length,
    dashes: (text.match(/[-—]/g) || []).length / sentences.length,
    exclamations: (text.match(/!/g) || []).length / sentences.length,
    questions: (text.match(/\?/g) || []).length / sentences.length,
  }
  
  // Contraction usage
  const contractions = (text.match(/\w+'\w+/g) || []).length
  const contractionUsage = contractions / words.length
  
  // Detect idioms and unique phrases
  const idioms = findIdioms(text)
  const uniquePhrases = findUniquePhrases(text)
  
  // Detect citation style
  const citationStyle = detectCitationStyle(text)
  
  return {
    averageWordLength,
    vocabularyComplexity: calculateVocabularyComplexity(wordFreq),
    commonWords: sortedWords.slice(0, 50),
    uniquePhrases,
    averageSentenceLength,
    sentenceVariation,
    sentenceStarters,
    averageParagraphLength,
    paragraphTransitions: transitions,
    formality,
    emotionalTone,
    activeVsPassive,
    punctuationFrequency,
    idioms,
    contractionUsage,
    citationStyle,
  }
}

// Helper functions
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(variance)
}

function calculateFormality(text: string): number {
  const informalIndicators = [
    /\b(gonna|wanna|gotta|kinda|sorta)\b/gi,
    /\b(yeah|yep|nope|ok|okay)\b/gi,
    /\b(stuff|things|like)\b/gi,
    /!+/g,
  ]
  
  const formalIndicators = [
    /\b(therefore|however|moreover|furthermore|nevertheless)\b/gi,
    /\b(utilize|implement|demonstrate|facilitate)\b/gi,
    /\b(significant|substantial|considerable)\b/gi,
  ]
  
  let informalScore = 0
  let formalScore = 0
  
  informalIndicators.forEach(pattern => {
    informalScore += (text.match(pattern) || []).length
  })
  
  formalIndicators.forEach(pattern => {
    formalScore += (text.match(pattern) || []).length
  })
  
  const totalIndicators = informalScore + formalScore
  if (totalIndicators === 0) return 5
  
  return Math.round(((formalScore / totalIndicators) * 9) + 1)
}

function detectEmotionalTone(text: string): string {
  const positiveWords = /\b(good|great|excellent|amazing|wonderful|happy|positive|love|enjoy)\b/gi
  const negativeWords = /\b(bad|terrible|awful|hate|negative|wrong|poor|sad|angry)\b/gi
  const academicWords = /\b(research|study|analysis|hypothesis|conclusion|evidence|theory)\b/gi
  
  const positiveCount = (text.match(positiveWords) || []).length
  const negativeCount = (text.match(negativeWords) || []).length
  const academicCount = (text.match(academicWords) || []).length
  
  if (academicCount > positiveCount + negativeCount) return "academic"
  if (positiveCount > negativeCount * 1.5) return "positive"
  if (negativeCount > positiveCount * 1.5) return "negative"
  return "neutral"
}

function calculateActivePassiveRatio(text: string): number {
  const passiveIndicators = /\b(was|were|been|being|is|are|am)\s+\w+ed\b/gi
  const passiveCount = (text.match(passiveIndicators) || []).length
  const sentences = text.split(/[.!?]+/).length
  
  return 1 - (passiveCount / sentences)
}

function findTransitionWords(text: string): string[] {
  const transitionPatterns = [
    /\b(however|therefore|moreover|furthermore|nevertheless|consequently)\b/gi,
    /\b(first|second|third|finally|lastly)\b/gi,
    /\b(in addition|in contrast|on the other hand|for example|for instance)\b/gi,
  ]
  
  const transitions = new Set<string>()
  transitionPatterns.forEach(pattern => {
    const matches = text.match(pattern) || []
    matches.forEach(match => transitions.add(match.toLowerCase()))
  })
  
  return Array.from(transitions)
}

function calculateVocabularyComplexity(wordFreq: Record<string, number>): number {
  const totalWords = Object.values(wordFreq).reduce((a, b) => a + b, 0)
  const uniqueWords = Object.keys(wordFreq).length
  const diversity = uniqueWords / totalWords
  
  // Consider word length
  const avgWordLength = Object.keys(wordFreq).reduce((sum, word) => 
    sum + (word.length * wordFreq[word]), 0) / totalWords
  
  // Scale to 1-10
  const complexityScore = (diversity * 5) + (avgWordLength / 2)
  return Math.min(10, Math.max(1, Math.round(complexityScore)))
}

function findIdioms(text: string): string[] {
  const commonIdioms = [
    "piece of cake",
    "break a leg",
    "hit the books",
    "under the weather",
    "on the ball",
    "cut to the chase",
    "in a nutshell",
    "food for thought",
  ]
  
  const found: string[] = []
  commonIdioms.forEach(idiom => {
    if (text.toLowerCase().includes(idiom)) {
      found.push(idiom)
    }
  })
  
  return found
}

function findUniquePhrases(text: string): string[] {
  // Extract 3-4 word phrases that appear multiple times
  const phrases: Record<string, number> = {}
  const words = text.toLowerCase().split(/\s+/)
  
  for (let i = 0; i < words.length - 3; i++) {
    const phrase3 = words.slice(i, i + 3).join(' ')
    const phrase4 = words.slice(i, i + 4).join(' ')
    
    phrases[phrase3] = (phrases[phrase3] || 0) + 1
    phrases[phrase4] = (phrases[phrase4] || 0) + 1
  }
  
  // Filter phrases that appear at least twice
  return Object.entries(phrases)
    .filter(([phrase, count]) => count >= 2 && !phrase.match(/^(the|and|of|to|in|a|an)/))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase]) => phrase)
}

function detectCitationStyle(text: string): string {
  // Simple detection based on patterns
  if (text.match(/\(\w+,?\s+\d{4}\)/)) return "APA"
  if (text.match(/\[\d+\]/)) return "IEEE"
  if (text.match(/\(\w+\s+\d+\)/)) return "MLA"
  if (text.match(/\.\s+\w+,\s+\w+\./)) return "Chicago"
  return "none"
}

// Generate text in a specific writing style
export async function generateInStyle(
  prompt: string,
  style: WritingStyle,
  aiLevel: string
): Promise<string> {
  const stylePrompt = `
You must write in a specific style with these characteristics:

VOCABULARY:
- Average word length: ${style.averageWordLength.toFixed(1)} characters
- Vocabulary complexity: ${style.vocabularyComplexity}/10
- Frequently use these words: ${style.commonWords.slice(0, 20).join(', ')}
- Include these phrases: ${style.uniquePhrases.join(', ')}

SENTENCE STRUCTURE:
- Average sentence length: ${style.averageSentenceLength.toFixed(0)} words
- Vary sentence length with standard deviation of ${style.sentenceVariation.toFixed(1)}
- Start sentences like: ${style.sentenceStarters.slice(0, 5).join(', ')}

PARAGRAPH STRUCTURE:
- Average paragraph length: ${style.averageParagraphLength.toFixed(0)} words
- Use these transitions: ${style.paragraphTransitions.join(', ')}

TONE AND STYLE:
- Formality level: ${style.formality}/10
- Emotional tone: ${style.emotionalTone}
- Active voice ratio: ${(style.activeVsPassive * 100).toFixed(0)}%
- Contractions frequency: ${style.contractionUsage > 0.01 ? 'use contractions' : 'avoid contractions'}

PUNCTUATION:
- Commas per sentence: ${style.punctuationFrequency.commas.toFixed(1)}
- Semicolons per sentence: ${style.punctuationFrequency.semicolons.toFixed(2)}
- Use ${style.punctuationFrequency.questions > 0.1 ? 'questions' : 'statements'}

${style.citationStyle !== 'none' ? `Use ${style.citationStyle} citation style.` : ''}

Now, ${prompt}
`

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(stylePrompt)
    return result.response.text()
  } catch (error) {
    console.error("Error generating styled text:", error)
    throw new Error("Failed to generate text in specified style")
  }
}

// Compare two writing samples for similarity
export function calculateStyleSimilarity(style1: WritingStyle, style2: WritingStyle): number {
  const features = [
    Math.abs(style1.averageWordLength - style2.averageWordLength) / 10,
    Math.abs(style1.vocabularyComplexity - style2.vocabularyComplexity) / 10,
    Math.abs(style1.averageSentenceLength - style2.averageSentenceLength) / 50,
    Math.abs(style1.formality - style2.formality) / 10,
    Math.abs(style1.activeVsPassive - style2.activeVsPassive),
    Math.abs(style1.contractionUsage - style2.contractionUsage) * 10,
  ]
  
  const avgDifference = features.reduce((a, b) => a + b, 0) / features.length
  return Math.max(0, 1 - avgDifference)
}