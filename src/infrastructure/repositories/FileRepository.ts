import { File } from '../../domain/entities/File';
import { IFileRepository } from '../../domain/repositories/IFileRepository';

export class FileRepository implements IFileRepository {
  private files: Map<string, File>;

  constructor() {
    this.files = new Map<string, File>();
  }

  async save(file: File): Promise<File> {
    this.files.set(file.id, file);
    return file;
  }

  async findById(id: string): Promise<File | null> {
    const file = this.files.get(id);
    return file || null;
  }

  async delete(id: string): Promise<void> {
    this.files.delete(id);
  }
} 