import { File } from '../../domain/entities/File';
import { IFileRepository } from '../../domain/repositories/IFileRepository';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

export class FileService {
  constructor(private readonly fileRepository: IFileRepository) {}

  async uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<File> {
    const fileHash = createHash('sha256').update(fileBuffer).digest('hex');
    const fileId = `${fileHash}-${uuidv4()}`;

    const file: File = {
      id: fileId,
      originalName,
      mimeType,
      size: fileBuffer.length,
      path: fileBuffer.toString('base64'),
      createdAt: new Date(),
    };

    return this.fileRepository.save(file);
  }

  async getFile(id: string): Promise<File | null> {
    return this.fileRepository.findById(id);
  }

  async deleteFile(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }
} 