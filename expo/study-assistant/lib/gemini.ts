import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// AI assistance level configurations
export const AI_LEVELS = {
  study_helper: {
    systemPrompt: `You are a helpful study assistant. Your role is to:
    - Answer questions about course materials
    - Explain concepts clearly
    - Provide study tips and strategies
    - Generate practice questions
    - Help with understanding, NOT doing homework
    - Guide students to find answers themselves
    - Never provide direct homework solutions
    - Encourage critical thinking`,
    model: "gemini-1.5-flash",
  },
  guided: {
    systemPrompt: `You are a guided learning assistant. Your role is to:
    - Provide step-by-step problem solving guidance
    - Give hints and partial solutions
    - Verify student work and provide feedback
    - Help with essay outlines (not full writing)
    - Explain mistakes and how to fix them
    - Provide examples similar to homework problems
    - Guide through the process without giving complete answers`,
    model: "gemini-1.5-flash",
  },
  autonomous: {
    systemPrompt: `You are a comprehensive academic assistant. Your role is to:
    - Provide complete solutions when appropriate
    - Write full essays and papers (with proper attribution notes)
    - Solve complex problems completely
    - Generate code implementations
    - Complete assignments as requested
    - Always remind students about academic integrity
    - Suggest they use this as a learning tool, not for direct submission`,
    model: "gemini-1.5-flash",
  },
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface GenerateResponseOptions {
  messages: ChatMessage[]
  aiLevel: keyof typeof AI_LEVELS
  context?: string // For RAG context later
  className?: string
  temperature?: number
}

export async function generateAIResponse({
  messages,
  aiLevel,
  context,
  className,
  temperature = 0.7,
}: GenerateResponseOptions): Promise<string> {
  try {
    const config = AI_LEVELS[aiLevel]
    const model = genAI.getGenerativeModel({
      model: config.model,
      safetySettings,
      generationConfig: {
        temperature,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    // Build the conversation history
    const chatHistory = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Create system context
    let systemContext = config.systemPrompt
    if (className) {
      systemContext += `\n\nYou are helping with the class: ${className}`
    }
    if (context) {
      systemContext += `\n\nRelevant course material context:\n${context}`
    }

    // Start chat with system prompt
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'll assist according to these guidelines." }],
        },
        ...chatHistory.slice(0, -1), // All messages except the last one
      ],
    })

    // Send the latest user message
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response
    
    return response.text()
  } catch (error) {
    console.error("Error generating AI response:", error)
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid API key configuration")
      }
      if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later.")
      }
      if (error.message.includes("safety")) {
        throw new Error("The content was blocked for safety reasons. Please rephrase your question.")
      }
    }
    
    throw new Error("Failed to generate AI response. Please try again.")
  }
}

// Function to sanitize and validate user input
export function sanitizeInput(input: string): string {
  // Remove any potential script tags or harmful content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
  
  // Limit length to prevent abuse
  const MAX_LENGTH = 4000
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }
  
  return sanitized.trim()
}

// Function to estimate token count (rough approximation)
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

// Function to check if content needs moderation
export function needsModeration(content: string): boolean {
  const suspiciousPatterns = [
    /generate.*malware/i,
    /hack.*system/i,
    /bypass.*security/i,
    /illegal.*activity/i,
    /create.*virus/i,
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(content))
}