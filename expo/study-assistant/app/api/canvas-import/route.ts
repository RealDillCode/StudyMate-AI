import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { 
  extractTextFromFile, 
  chunkText, 
  cleanText,
  generateDocumentSummary 
} from "@/lib/document-processor"
import { createDocumentIndex, serializeEmbedding } from "@/lib/embeddings"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { pageType, course, timestamp } = data

    // Find or create class based on Canvas course
    let classRecord = await prisma.class.findFirst({
      where: {
        userId: session.user.id,
        metadata: {
          path: ["canvasId"],
          equals: course?.id
        }
      }
    })

    if (!classRecord && course?.id) {
      // Create new class from Canvas course
      classRecord = await prisma.class.create({
        data: {
          userId: session.user.id,
          name: course.name || `Canvas Course ${course.id}`,
          description: `Imported from Canvas on ${new Date().toLocaleDateString()}`,
          semester: extractSemester(course.name),
          metadata: {
            canvasId: course.id,
            canvasUrl: course.url,
            imported: true,
            importDate: timestamp
          }
        }
      })
    }

    if (!classRecord) {
      return NextResponse.json(
        { message: "Could not find or create class" },
        { status: 400 }
      )
    }

    // Process different types of Canvas data
    const results = {
      classId: classRecord.id,
      imported: []
    }

    // Process assignments
    if (data.assignment) {
      const assignment = data.assignment
      const material = await prisma.material.create({
        data: {
          classId: classRecord.id,
          name: assignment.title || "Assignment",
          originalName: assignment.title || "Assignment",
          type: "assignment",
          mimeType: "text/html",
          content: cleanText(stripHtml(assignment.description || "")),
          summary: await generateDocumentSummary(stripHtml(assignment.description || "")),
          processed: true,
          metadata: {
            source: "canvas",
            dueDate: assignment.dueDate,
            points: assignment.points,
            rubric: assignment.rubric,
            url: assignment.url
          }
        }
      })

      // Create embeddings for assignment
      if (assignment.description) {
        const cleanedText = cleanText(stripHtml(assignment.description))
        const chunks = chunkText(cleanedText, 500, 100)
        const documentChunks = await createDocumentIndex(
          cleanedText,
          material.id,
          chunks.slice(0, 10) // Limit chunks for assignments
        )

        await prisma.materialChunk.createMany({
          data: documentChunks.map((chunk, index) => ({
            materialId: material.id,
            chunkIndex: index,
            text: chunk.text,
            embedding: serializeEmbedding(chunk.embedding),
            metadata: chunk.metadata as any
          }))
        })
      }

      results.imported.push({ type: "assignment", id: material.id })
    }

    // Process syllabus
    if (data.syllabus?.content) {
      const syllabusText = cleanText(stripHtml(data.syllabus.content))
      
      const material = await prisma.material.create({
        data: {
          classId: classRecord.id,
          name: "Course Syllabus",
          originalName: "syllabus.html",
          type: "syllabus",
          mimeType: "text/html",
          content: syllabusText,
          summary: await generateDocumentSummary(syllabusText),
          processed: true,
          metadata: {
            source: "canvas",
            url: data.syllabus.url
          }
        }
      })

      // Create embeddings
      const chunks = chunkText(syllabusText, 1000, 200)
      const documentChunks = await createDocumentIndex(
        syllabusText,
        material.id,
        chunks.slice(0, 20)
      )

      await prisma.materialChunk.createMany({
        data: documentChunks.map((chunk, index) => ({
          materialId: material.id,
          chunkIndex: index,
          text: chunk.text,
          embedding: serializeEmbedding(chunk.embedding),
          metadata: chunk.metadata as any
        }))
      })

      results.imported.push({ type: "syllabus", id: material.id })
    }

    // Process files list (store metadata only, actual files need separate download)
    if (data.files && Array.isArray(data.files)) {
      for (const file of data.files.slice(0, 10)) { // Limit to 10 files
        const material = await prisma.material.create({
          data: {
            classId: classRecord.id,
            name: file.name,
            originalName: file.name,
            type: file.type || "file",
            mimeType: getMimeType(file.name),
            processed: false, // Mark for later download
            metadata: {
              source: "canvas",
              canvasUrl: file.url,
              fileSize: file.size,
              needsDownload: true
            }
          }
        })

        results.imported.push({ type: "file_reference", id: material.id })
      }
    }

    // Process modules
    if (data.modules && Array.isArray(data.modules)) {
      for (const module of data.modules) {
        const moduleContent = module.items?.map(item => item.title).join("\n") || ""
        
        if (moduleContent) {
          const material = await prisma.material.create({
            data: {
              classId: classRecord.id,
              name: module.name || "Module",
              originalName: module.name || "module",
              type: "module",
              mimeType: "text/plain",
              content: moduleContent,
              processed: true,
              metadata: {
                source: "canvas",
                items: module.items
              }
            }
          })

          results.imported.push({ type: "module", id: material.id })
        }
      }
    }

    // Process announcements
    if (data.announcements && Array.isArray(data.announcements)) {
      const announcementsText = data.announcements
        .map(a => `${a.title}\n${stripHtml(a.content || "")}\n${a.date || ""}`)
        .join("\n\n---\n\n")

      if (announcementsText) {
        const material = await prisma.material.create({
          data: {
            classId: classRecord.id,
            name: "Course Announcements",
            originalName: "announcements",
            type: "announcements",
            mimeType: "text/plain",
            content: cleanText(announcementsText),
            processed: true,
            metadata: {
              source: "canvas",
              announcements: data.announcements
            }
          }
        })

        results.imported.push({ type: "announcements", id: material.id })
      }
    }

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error) {
    console.error("Canvas import error:", error)
    return NextResponse.json(
      { message: "Failed to import Canvas data" },
      { status: 500 }
    )
  }
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

// Extract semester from course name
function extractSemester(courseName: string): string {
  const patterns = [
    /Fall \d{4}/i,
    /Spring \d{4}/i,
    /Summer \d{4}/i,
    /Winter \d{4}/i,
    /\d{4}-\d{4}/,
  ]

  for (const pattern of patterns) {
    const match = courseName.match(pattern)
    if (match) return match[0]
  }

  return ""
}

// Get MIME type from filename
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    md: "text/markdown",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  }

  return mimeTypes[ext || ""] || "application/octet-stream"
}