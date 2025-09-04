import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAIResponse, sanitizeInput, needsModeration } from "@/lib/gemini"
import rateLimit from "@/lib/rate-limit"

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify ownership through class
    const chat = await prisma.chat.findFirst({
      where: {
        id: params.chatId,
        class: {
          userId: session.user.id,
        },
      },
    })

    if (!chat) {
      return NextResponse.json(
        { message: "Chat not found" },
        { status: 404 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: params.chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { content, aiLevel } = await req.json()

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      )
    }

    // Rate limiting - 10 messages per minute per user
    try {
      await limiter.check(10, `user_${session.user.id}`)
    } catch {
      return NextResponse.json(
        { message: "Too many requests. Please wait a moment before sending another message." },
        { status: 429 }
      )
    }

    // Sanitize user input
    const sanitizedContent = sanitizeInput(content)

    // Check for potentially harmful content
    if (needsModeration(sanitizedContent)) {
      return NextResponse.json(
        { message: "Your message contains potentially inappropriate content. Please rephrase." },
        { status: 400 }
      )
    }

    // Verify ownership and get chat with class info
    const chat = await prisma.chat.findFirst({
      where: {
        id: params.chatId,
        class: {
          userId: session.user.id,
        },
      },
      include: {
        class: true,
      },
    })

    if (!chat) {
      return NextResponse.json(
        { message: "Chat not found" },
        { status: 404 }
      )
    }

    // Get recent messages for context (last 10 messages)
    const recentMessages = await prisma.message.findMany({
      where: {
        chatId: params.chatId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        role: true,
        content: true,
      },
    })

    // Reverse to get chronological order
    const messageHistory = recentMessages.reverse().map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }))

    // Add the new user message to history
    messageHistory.push({
      role: "user",
      content: sanitizedContent,
    })

    // Generate AI response
    let aiResponse: string
    try {
      aiResponse = await generateAIResponse({
        messages: messageHistory,
        aiLevel: (aiLevel || chat.aiLevel) as "study_helper" | "guided" | "autonomous",
        className: chat.class.name,
        temperature: 0.7,
      })
    } catch (error) {
      console.error("Gemini API error:", error)
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes("quota")) {
          return NextResponse.json(
            { message: "AI service quota exceeded. Please try again later." },
            { status: 429 }
          )
        }
        if (error.message.includes("API key")) {
          return NextResponse.json(
            { message: "AI service configuration error. Please contact support." },
            { status: 500 }
          )
        }
        if (error.message.includes("safety")) {
          return NextResponse.json(
            { message: error.message },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json(
        { message: "Failed to generate AI response. Please try again." },
        { status: 500 }
      )
    }

    // Save both messages to database
    const [userMessage, assistantMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          chatId: params.chatId,
          role: "user",
          content: sanitizedContent,
          metadata: {
            aiLevel: aiLevel || chat.aiLevel,
          },
        },
      }),
      prisma.message.create({
        data: {
          chatId: params.chatId,
          role: "assistant",
          content: aiResponse,
          metadata: {
            model: "gemini-1.5-flash",
            aiLevel: aiLevel || chat.aiLevel,
          },
        },
      }),
    ])

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: {
        id: params.chatId,
      },
      data: {
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      aiMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
    })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}