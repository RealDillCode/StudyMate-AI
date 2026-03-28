import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const classData = await prisma.class.findFirst({
      where: {
        id: params.classId,
        userId: session.user.id,
      },
      include: {
        chats: {
          orderBy: {
            createdAt: "desc",
          },
        },
        materials: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json(
        { message: "Class not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(classData)
  } catch (error) {
    console.error("Error fetching class:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify ownership
    const classData = await prisma.class.findFirst({
      where: {
        id: params.classId,
        userId: session.user.id,
      },
    })

    if (!classData) {
      return NextResponse.json(
        { message: "Class not found" },
        { status: 404 }
      )
    }

    // Delete class (cascades to chats, messages, materials)
    await prisma.class.delete({
      where: {
        id: params.classId,
      },
    })

    return NextResponse.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}