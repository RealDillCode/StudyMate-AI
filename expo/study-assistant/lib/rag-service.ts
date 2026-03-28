import { prisma } from "@/lib/prisma"
import { 
  generateEmbedding, 
  deserializeEmbedding,
  cosineSimilarity 
} from "@/lib/embeddings"

interface RelevantChunk {
  text: string
  similarity: number
  materialName: string
  materialId: string
}

// Search for relevant content across all materials in a class
export async function searchClassMaterials(
  query: string,
  classId: string,
  topK: number = 3,
  similarityThreshold: number = 0.7
): Promise<RelevantChunk[]> {
  try {
    // Get all processed materials with chunks for the class
    const materials = await prisma.material.findMany({
      where: {
        classId,
        processed: true,
      },
      include: {
        chunks: {
          select: {
            id: true,
            text: true,
            embedding: true,
            metadata: true,
          },
        },
      },
    })

    if (materials.length === 0) {
      return []
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Calculate similarities for all chunks
    const allChunksWithScores: RelevantChunk[] = []

    for (const material of materials) {
      for (const chunk of material.chunks) {
        const chunkEmbedding = deserializeEmbedding(chunk.embedding)
        const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding)

        if (similarity >= similarityThreshold) {
          allChunksWithScores.push({
            text: chunk.text,
            similarity,
            materialName: material.name,
            materialId: material.id,
          })
        }
      }
    }

    // Sort by similarity and return top K
    allChunksWithScores.sort((a, b) => b.similarity - a.similarity)
    return allChunksWithScores.slice(0, topK)
  } catch (error) {
    console.error("Error searching materials:", error)
    return []
  }
}

// Format retrieved chunks into context for the AI
export function formatRAGContext(chunks: RelevantChunk[]): string {
  if (chunks.length === 0) {
    return ""
  }

  let context = "Relevant information from course materials:\n\n"

  chunks.forEach((chunk, index) => {
    context += `[Source: ${chunk.materialName}]\n`
    context += `${chunk.text}\n\n`
  })

  context += "---\n\n"
  context += "Use the above information to help answer the question, citing sources when appropriate."

  return context
}

// Check if a query should trigger RAG search
export function shouldUseRAG(query: string): boolean {
  // Keywords that suggest the user wants to reference course materials
  const ragKeywords = [
    "textbook",
    "chapter",
    "page",
    "lecture",
    "slides",
    "notes",
    "material",
    "document",
    "reading",
    "assignment",
    "according to",
    "based on",
    "from the",
    "in the course",
    "we learned",
    "we covered",
    "professor said",
    "homework",
    "problem set",
  ]

  const lowerQuery = query.toLowerCase()
  
  // Check if query contains any RAG keywords
  const containsKeyword = ragKeywords.some(keyword => 
    lowerQuery.includes(keyword)
  )

  // Also check for questions that likely need course context
  const isContextualQuestion = 
    lowerQuery.includes("what") ||
    lowerQuery.includes("explain") ||
    lowerQuery.includes("define") ||
    lowerQuery.includes("describe") ||
    lowerQuery.includes("how does") ||
    lowerQuery.includes("why")

  return containsKeyword || isContextualQuestion
}

// Get a summary of available materials for a class
export async function getClassMaterialsSummary(classId: string): Promise<string> {
  const materials = await prisma.material.findMany({
    where: {
      classId,
      processed: true,
    },
    select: {
      name: true,
      type: true,
      summary: true,
      metadata: true,
    },
  })

  if (materials.length === 0) {
    return ""
  }

  let summary = "Available course materials:\n"
  
  materials.forEach((material, index) => {
    summary += `${index + 1}. ${material.name} (${material.type.toUpperCase()})`
    if (material.summary) {
      summary += `: ${material.summary.substring(0, 100)}...`
    }
    summary += "\n"
  })

  return summary
}

// Enhanced search with metadata filtering
export async function searchWithMetadata(
  query: string,
  classId: string,
  filters?: {
    materialType?: string
    pageNumber?: number
    section?: string
  }
): Promise<RelevantChunk[]> {
  // Get materials matching filters
  const whereClause: any = {
    classId,
    processed: true,
  }

  if (filters?.materialType) {
    whereClause.type = filters.materialType
  }

  const materials = await prisma.material.findMany({
    where: whereClause,
    include: {
      chunks: {
        where: filters?.pageNumber ? {
          metadata: {
            path: ["pageNumber"],
            equals: filters.pageNumber,
          },
        } : undefined,
        select: {
          id: true,
          text: true,
          embedding: true,
          metadata: true,
        },
      },
    },
  })

  // Continue with regular search
  if (materials.length === 0) {
    return []
  }

  const queryEmbedding = await generateEmbedding(query)
  const results: RelevantChunk[] = []

  for (const material of materials) {
    for (const chunk of material.chunks) {
      const chunkEmbedding = deserializeEmbedding(chunk.embedding)
      const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding)

      if (similarity >= 0.7) {
        results.push({
          text: chunk.text,
          similarity,
          materialName: material.name,
          materialId: material.id,
        })
      }
    }
  }

  results.sort((a, b) => b.similarity - a.similarity)
  return results.slice(0, 5)
}