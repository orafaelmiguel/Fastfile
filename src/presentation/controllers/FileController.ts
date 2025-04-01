import { Request, Response } from 'express';
import { FileService } from '../../application/services/FileService';

export class FileController {
  constructor(private readonly fileService: FileService) {}

  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const file = await this.fileService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.status(201).json({
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 