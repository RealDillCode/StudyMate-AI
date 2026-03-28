import { pdfParse } from "pdf-parse-new"

// Process different document types and extract text
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    switch (mimeType) {
      case "application/pdf":
        return await extractFromPDF(buffer)
      
      case "text/plain":
      case "text/markdown":
        return buffer.toString("utf-8")
      
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        // For MVP, we'll ask users to save as PDF or TXT
        // Full implementation would use mammoth or similar
        return "Please convert Word documents to PDF or TXT format for now."
      
      case "image/jpeg":
      case "image/png":
      case "image/webp":
        // For MVP, no OCR - would need Tesseract or Cloud Vision API
        return "[Image file - OCR not yet implemented]"
      
      default:
        return ""
    }
  } catch (error) {
    console.error("Error extracting text:", error)
    throw new Error("Failed to extract text from document")
  }
}

// Extract text from PDF
async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

// Chunk text for vector embeddings
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/)
  
  let currentChunk = ""
  let currentSize = 0
  
  for (const sentence of sentences) {
    const sentenceSize = sentence.length
    
    if (currentSize + sentenceSize > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      
      // Add overlap by keeping last part of current chunk
      const overlapText = currentChunk.split(" ").slice(-Math.floor(overlap / 5)).join(" ")
      currentChunk = overlapText + " " + sentence
      currentSize = currentChunk.length
    } else {
      currentChunk += " " + sentence
      currentSize += sentenceSize
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

// Clean and prepare text for processing
export function cleanText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, " ")
  
  // Remove special characters that might break processing
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
  
  // Remove excessive line breaks
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n")
  
  // Trim
  cleaned = cleaned.trim()
  
  return cleaned
}

// Extract metadata from text (title, topics, etc.)
export function extractMetadata(text: string): {
  title?: string
  topics: string[]
  pageCount?: number
} {
  const lines = text.split("\n")
  const metadata: any = {
    topics: [],
  }
  
  // Try to extract title (usually first non-empty line)
  for (const line of lines) {
    if (line.trim().length > 0 && line.trim().length < 200) {
      metadata.title = line.trim()
      break
    }
  }
  
  // Extract potential topics (look for headers)
  const topicPatterns = [
    /^Chapter \d+[:\s]+(.+)$/i,
    /^Section \d+[:\s]+(.+)$/i,
    /^Unit \d+[:\s]+(.+)$/i,
    /^Module \d+[:\s]+(.+)$/i,
    /^Topic[:\s]+(.+)$/i,
  ]
  
  for (const line of lines) {
    for (const pattern of topicPatterns) {
      const match = line.match(pattern)
      if (match && match[1]) {
        metadata.topics.push(match[1].trim())
      }
    }
  }
  
  // Estimate page count (rough approximation)
  const wordsPerPage = 500
  const wordCount = text.split(/\s+/).length
  metadata.pageCount = Math.ceil(wordCount / wordsPerPage)
  
  return metadata
}

// Generate summary of document
export async function generateDocumentSummary(
  text: string,
  maxLength: number = 500
): Promise<string> {
  // For MVP, simple extraction of first meaningful paragraph
  // In production, would use Gemini to generate proper summary
  
  const paragraphs = text.split(/\n\n+/)
  let summary = ""
  
  for (const paragraph of paragraphs) {
    const cleaned = paragraph.trim()
    if (cleaned.length > 50 && cleaned.length < 1000) {
      summary = cleaned
      break
    }
  }
  
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + "..."
  }
  
  return summary || text.substring(0, maxLength)
}