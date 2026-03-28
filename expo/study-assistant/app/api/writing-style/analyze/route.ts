import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeWritingStyle } from "@/lib/writing-style-analyzer"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { samples, name } = await req.json()

    if (!samples || samples.length < 3) {
      return NextResponse.json(
        { message: "At least 3 writing samples are required" },
        { status: 400 }
      )
    }

    // Combine all samples for analysis
    const combinedText = samples.join("\n\n")
    
    // Analyze the writing style
    const styleAnalysis = analyzeWritingStyle(combinedText)
    
    // Store the writing style profile
    const profile = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        // Store in user metadata (you'll need to update schema)
        // For now, we'll return it directly
      },
    })

    return NextResponse.json({
      success: true,
      profile: {
        id: session.user.id,
        name: name || "My Writing Style",
        samplesCount: samples.length,
        accuracy: 85, // Placeholder - would calculate based on validation
        createdAt: new Date().toISOString(),
        style: styleAnalysis,
      },
    })
  } catch (error) {
    console.error("Style analysis error:", error)
    return NextResponse.json(
      { message: "Failed to analyze writing style" },
      { status: 500 }
    )
  }
}