import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Generate embeddings using Gemini
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const result = await model.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw new Error("Failed to generate embedding")
  }
}

// Generate embeddings for multiple texts
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []
  
  // Process in batches to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const batchEmbeddings = await Promise.all(
      batch.map(text => generateEmbedding(text))
    )
    embeddings.push(...batchEmbeddings)
    
    // Small delay to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return embeddings
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length")
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)
  
  if (normA === 0 || normB === 0) {
    return 0
  }
  
  return dotProduct / (normA * normB)
}

// Find most similar chunks to a query
export async function findSimilarChunks(
  queryEmbedding: number[],
  chunks: Array<{ id: string; text: string; embedding: number[] }>,
  topK: number = 5,
  threshold: number = 0.7
): Promise<Array<{ id: string; text: string; similarity: number }>> {
  const similarities = chunks.map(chunk => ({
    id: chunk.id,
    text: chunk.text,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }))
  
  // Sort by similarity and filter by threshold
  const relevant = similarities
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
  
  return relevant
}

// Store embeddings in database (simplified for MVP)
export function serializeEmbedding(embedding: number[]): string {
  return JSON.stringify(embedding)
}

export function deserializeEmbedding(serialized: string): number[] {
  return JSON.parse(serialized)
}

// Create a searchable index from document chunks
export interface DocumentChunk {
  id: string
  materialId: string
  text: string
  embedding: number[]
  metadata?: {
    pageNumber?: number
    section?: string
    [key: string]: any
  }
}

export async function createDocumentIndex(
  text: string,
  materialId: string,
  chunks: string[]
): Promise<DocumentChunk[]> {
  const embeddings = await generateEmbeddings(chunks)
  
  return chunks.map((chunk, index) => ({
    id: `${materialId}_chunk_${index}`,
    materialId,
    text: chunk,
    embedding: embeddings[index],
    metadata: {
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }))
}

// Search across multiple documents
export async function searchDocuments(
  query: string,
  documents: DocumentChunk[],
  topK: number = 5
): Promise<Array<{ text: string; similarity: number; materialId: string }>> {
  const queryEmbedding = await generateEmbedding(query)
  
  const results = await findSimilarChunks(
    queryEmbedding,
    documents.map(doc => ({
      id: doc.id,
      text: doc.text,
      embedding: doc.embedding,
    })),
    topK
  )
  
  return results.map(result => {
    const doc = documents.find(d => d.id === result.id)!
    return {
      text: result.text,
      similarity: result.similarity,
      materialId: doc.materialId,
    }
  })
}