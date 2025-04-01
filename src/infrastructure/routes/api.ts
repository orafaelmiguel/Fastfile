import express from 'express';
import { FileController } from '../controllers/FileController';
import { ConversionController } from '../controllers/ConversionController';
import { fileUploadMiddleware } from '../middleware/FileUploadMiddleware';

const router = express.Router();
const fileController = new FileController();
const conversionController = new ConversionController();

// Rota para obter formatos suportados
router.get('/formats', conversionController.getSupportedFormats.bind(conversionController));

// Rota para upload de arquivo
router.post('/upload', 
  fileUploadMiddleware.single('file'),
  fileController.uploadFile.bind(fileController)
);

// Rota para converter arquivo
router.post('/convert',
  fileUploadMiddleware.single('file'),
  conversionController.convertFile.bind(conversionController)
);

// Rota para download do arquivo convertido
router.get('/download/:fileName', conversionController.downloadFile.bind(conversionController));

export default router; 