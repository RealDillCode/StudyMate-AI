import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, aiLevel, classId } = await req.json()

    if (!name || !classId) {
      return NextResponse.json(
        { message: "Name and classId are required" },
        { status: 400 }
      )
    }

    // Verify class ownership
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        userId: session.user.id,
      },
    })

    if (!classData) {
      return NextResponse.json(
        { message: "Class not found" },
        { status: 404 }
      )
    }

    const newChat = await prisma.chat.create({
      data: {
        name,
        aiLevel: aiLevel || "study_helper",
        classId,
      },
    })

    return NextResponse.json(newChat, { status: 201 })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}