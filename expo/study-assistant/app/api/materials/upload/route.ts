import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { 
  uploadFile, 
  isValidFileType, 
  sanitizeFilename,
  isFileSafe,
  FILE_CONFIG 
} from "@/lib/file-storage"
import { 
  extractTextFromFile, 
  chunkText, 
  cleanText,
  extractMetadata,
  generateDocumentSummary
} from "@/lib/document-processor"
import { createDocumentIndex, serializeEmbedding } from "@/lib/embeddings"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const classId = formData.get("classId") as string

    if (!file || !classId) {
      return NextResponse.json(
        { message: "File and classId are required" },
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

    // Validate file type
    if (!isValidFileType(file.type, file.name)) {
      return NextResponse.json(
        { message: "Invalid file type. Supported: PDF, TXT, MD, DOC, DOCX, PPT, PPTX, JPG, PNG" },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > FILE_CONFIG.maxFileSize) {
      return NextResponse.json(
        { message: `File too large. Maximum size: ${FILE_CONFIG.maxFileSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Basic security check
    if (!isFileSafe(buffer)) {
      return NextResponse.json(
        { message: "File failed security check" },
        { status: 400 }
      )
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name)

    // Upload file to storage
    const { filePath, secureFilename } = await uploadFile(
      buffer,
      sanitizedName,
      file.type,
      session.user.id,
      classId
    )

    // Create material record
    const material = await prisma.material.create({
      data: {
        classId,
        name: sanitizedName,
        originalName: file.name,
        type: file.type.split("/")[1] || "unknown",
        mimeType: file.type,
        filePath,
        fileSize: file.size,
        processed: false,
      },
    })

    // Process document asynchronously (in production, use a job queue)
    processDocument(material.id, buffer, file.type).catch(error => {
      console.error("Error processing document:", error)
    })

    return NextResponse.json({
      message: "File uploaded successfully",
      material: {
        id: material.id,
        name: material.name,
        type: material.type,
        fileSize: material.fileSize,
        processed: material.processed,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { message: "Failed to upload file" },
      { status: 500 }
    )
  }
}

// Process document in the background
async function processDocument(
  materialId: string,
  buffer: Buffer,
  mimeType: string
) {
  try {
    // Extract text from document
    const rawText = await extractTextFromFile(buffer, mimeType)
    
    if (!rawText || rawText.length < 10) {
      console.log("No text content to process")
      await prisma.material.update({
        where: { id: materialId },
        data: { 
          processed: true,
          content: "[No text content found]",
        },
      })
      return
    }

    // Clean text
    const cleanedText = cleanText(rawText)
    
    // Generate summary
    const summary = await generateDocumentSummary(cleanedText)
    
    // Extract metadata
    const metadata = extractMetadata(cleanedText)
    
    // Update material with extracted content
    await prisma.material.update({
      where: { id: materialId },
      data: {
        content: cleanedText,
        summary,
        metadata: metadata as any,
      },
    })

    // Chunk text for embeddings
    const chunks = chunkText(cleanedText, 1000, 200)
    
    // Generate embeddings for chunks (limit to first 20 chunks for MVP)
    const chunksToProcess = chunks.slice(0, 20)
    const documentChunks = await createDocumentIndex(
      cleanedText,
      materialId,
      chunksToProcess
    )

    // Store chunks with embeddings
    await prisma.materialChunk.createMany({
      data: documentChunks.map((chunk, index) => ({
        materialId,
        chunkIndex: index,
        text: chunk.text,
        embedding: serializeEmbedding(chunk.embedding),
        metadata: chunk.metadata as any,
      })),
    })

    // Mark as processed
    await prisma.material.update({
      where: { id: materialId },
      data: { processed: true },
    })

    console.log(`Document ${materialId} processed successfully`)
  } catch (error) {
    console.error(`Error processing document ${materialId}:`, error)
    
    // Mark as processed with error
    await prisma.material.update({
      where: { id: materialId },
      data: { 
        processed: true,
        metadata: {
          error: "Failed to process document",
        },
      },
    })
  }
}