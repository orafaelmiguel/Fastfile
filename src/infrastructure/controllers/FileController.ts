import { Request, Response } from 'express';
import { FileService } from '../../application/services/FileService';
import { FileRepository } from '../../infrastructure/repositories/FileRepository';

export class FileController {
  private fileService: FileService;

  constructor() {
    const fileRepository = new FileRepository();
    this.fileService = new FileService(fileRepository);
  }

  public async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo enviado' });
        return;
      }

      const file = await this.fileService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.status(200).json({
        message: 'Arquivo enviado com sucesso',
        file: {
          id: file.id,
          name: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
        },
      });
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
  }
} 