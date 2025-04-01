import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from '../routes';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Configuração do limite de tamanho do arquivo
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
}));
app.use(express.urlencoded({ 
  limit: process.env.MAX_FILE_SIZE || '10mb', 
  extended: true,
}));

// Rotas
app.use('/', routes);

export default app; 