import { File } from '../../domain/entities/File';
import { IFileRepository } from '../../domain/repositories/IFileRepository';
import fs from 'fs/promises';
import path from 'path';

export class FileRepository implements IFileRepository {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
  }

  async save(file: File): Promise<File> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, file.id);
    await fs.writeFile(filePath, file.path);
    return file;
  }

  async findById(id: string): Promise<File | null> {
    try {
      const filePath = path.join(this.uploadDir, id);
      await fs.access(filePath);
      return {
        id,
        originalName: id,
        mimeType: 'application/octet-stream',
        size: (await fs.stat(filePath)).size,
        path: filePath,
        createdAt: new Date(),
      };
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, id);
      await fs.unlink(filePath);
    } catch {
      throw new Error('File not found');
    }
  }
} 