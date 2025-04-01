import { Router } from 'express';
import path from 'path';
import { FileController } from '../presentation/controllers/FileController';
import { FileService } from '../application/services/FileService';
import { FileRepository } from '../infrastructure/repositories/FileRepository';
import { fileUploadMiddleware } from '../infrastructure/middleware/FileUploadMiddleware';

const router = Router();
const fileRepository = new FileRepository();
const fileService = new FileService(fileRepository);
const fileController = new FileController(fileService);

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.post('/upload', fileUploadMiddleware.single('file'), (req, res) => fileController.uploadFile(req, res));

export default router;