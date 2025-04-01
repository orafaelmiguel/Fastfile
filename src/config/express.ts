import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from '../infrastructure/routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));

// Configuração do limite de tamanho do arquivo
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
}));
app.use(express.urlencoded({ 
  limit: process.env.MAX_FILE_SIZE || '10mb', 
  extended: true,
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../../public')));

// Rotas
app.use('/api', apiRoutes);

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

export default app; 