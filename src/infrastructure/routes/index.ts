import { Router } from 'express';
import { FileController } from '../controllers/FileController';
import { ConversionController } from '../controllers/ConversionController';
import { fileUploadMiddleware } from '../middleware/FileUploadMiddleware';

const router = Router();
const fileController = new FileController();
const conversionController = new ConversionController();

// Rotas de upload
router.post('/upload', fileUploadMiddleware.single('file'), fileController.uploadFile.bind(fileController));

// Rotas de conversão
router.post('/convert', fileUploadMiddleware.single('file'), conversionController.convertFile.bind(conversionController));
router.get('/download/:fileName', conversionController.downloadFile.bind(conversionController));

export default router; 