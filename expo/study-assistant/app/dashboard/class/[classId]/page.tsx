import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ClassDetailClient from "./class-detail-client"

export default async function ClassDetailPage({
  params,
}: {
  params: { classId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
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
        select: {
          id: true,
          name: true,
          type: true,
          fileSize: true,
          processed: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!classData) {
    redirect("/dashboard")
  }

  return <ClassDetailClient classData={classData} />
}