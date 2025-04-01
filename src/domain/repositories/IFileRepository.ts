import { File } from '../entities/File';

export interface IFileRepository {
  save(file: File): Promise<File>;
  findById(id: string): Promise<File | null>;
  delete(id: string): Promise<void>;
} 