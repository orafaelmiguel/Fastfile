import { Router } from 'express';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.post('/upload', (req, res) => {
  res.status(501).json({ message: 'Upload functionality coming soon' });
});

export default router; 