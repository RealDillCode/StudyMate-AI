import { writeFile, unlink, mkdir, readFile } from "fs/promises"
import path from "path"
import crypto from "crypto"

// File upload configuration
export const FILE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    "application/pdf": [".pdf"],
    "text/plain": [".txt", ".md"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-powerpoint": [".ppt"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  uploadDir: path.join(process.cwd(), "uploads"),
}

// Ensure upload directory exists
async function ensureUploadDir(userId: string, classId: string) {
  const userDir = path.join(FILE_CONFIG.uploadDir, userId, classId)
  await mkdir(userDir, { recursive: true })
  return userDir
}

// Generate secure filename
function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const hash = crypto.randomBytes(16).toString("hex")
  const timestamp = Date.now()
  return `${timestamp}-${hash}${ext}`
}

// Validate file type
export function isValidFileType(mimeType: string, filename: string): boolean {
  if (!FILE_CONFIG.allowedTypes[mimeType]) {
    return false
  }
  
  const ext = path.extname(filename).toLowerCase()
  return FILE_CONFIG.allowedTypes[mimeType].includes(ext)
}

// Sanitize filename for storage
export function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts
  let sanitized = filename.replace(/[\/\\]/g, "")
  // Remove special characters except dots and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, "_")
  // Limit length
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized)
    const name = path.basename(sanitized, ext)
    sanitized = name.substring(0, 250 - ext.length) + ext
  }
  return sanitized
}

// Upload file to local storage
export async function uploadFile(
  file: Buffer,
  originalName: string,
  mimeType: string,
  userId: string,
  classId: string
): Promise<{ filePath: string; secureFilename: string }> {
  // Ensure upload directory exists
  const uploadDir = await ensureUploadDir(userId, classId)
  
  // Generate secure filename
  const secureFilename = generateSecureFilename(originalName)
  const filePath = path.join(uploadDir, secureFilename)
  
  // Write file to disk
  await writeFile(filePath, file)
  
  // Return relative path for database storage
  const relativePath = path.relative(process.cwd(), filePath)
  
  return {
    filePath: relativePath,
    secureFilename,
  }
}

// Delete file from storage
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath)
    await unlink(fullPath)
  } catch (error) {
    console.error("Error deleting file:", error)
    // Don't throw - file might already be deleted
  }
}

// Read file from storage
export async function readFileFromStorage(filePath: string): Promise<Buffer> {
  const fullPath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(process.cwd(), filePath)
  return await readFile(fullPath)
}

// Check if file exists and is safe
export function isFileSafe(buffer: Buffer): boolean {
  // Check for common malware signatures (basic check)
  const malwareSignatures = [
    Buffer.from("4D5A"), // EXE files
    Buffer.from("504B0304"), // Some ZIP-based exploits
    Buffer.from("CAFEBABE"), // Java class files
  ]
  
  const fileStart = buffer.slice(0, 4)
  
  for (const signature of malwareSignatures) {
    if (fileStart.includes(signature)) {
      return false
    }
  }
  
  return true
}

// Get file extension from mime type
export function getExtensionFromMimeType(mimeType: string): string {
  const extensions = FILE_CONFIG.allowedTypes[mimeType]
  return extensions ? extensions[0] : ".bin"
}