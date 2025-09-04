import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/file-storage"

export async function GET(
  req: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const material = await prisma.material.findFirst({
      where: {
        id: params.materialId,
        class: {
          userId: session.user.id,
        },
      },
      include: {
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            text: true,
            metadata: true,
          },
          orderBy: {
            chunkIndex: "asc",
          },
        },
      },
    })

    if (!material) {
      return NextResponse.json(
        { message: "Material not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error("Error fetching material:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { materialId: string } }
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
    const material = await prisma.material.findFirst({
      where: {
        id: params.materialId,
        class: {
          userId: session.user.id,
        },
      },
    })

    if (!material) {
      return NextResponse.json(
        { message: "Material not found" },
        { status: 404 }
      )
    }

    // Delete file from storage if it exists
    if (material.filePath) {
      await deleteFile(material.filePath)
    }

    // Delete from database (chunks will cascade delete)
    await prisma.material.delete({
      where: {
        id: params.materialId,
      },
    })

    return NextResponse.json(
      { message: "Material deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting material:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}