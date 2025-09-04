import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
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

    const { aiLevel } = await req.json()

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

    const updatedChat = await prisma.chat.update({
      where: {
        id: params.chatId,
      },
      data: {
        aiLevel,
      },
    })

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.chat.delete({
      where: {
        id: params.chatId,
      },
    })

    return NextResponse.json(
      { message: "Chat deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting chat:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}