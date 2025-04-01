import { Request, Response } from 'express';
import { ConversionService } from '../../application/services/ConversionService';
import path from 'path';

export class ConversionController {
    private conversionService: ConversionService;

    constructor() {
        this.conversionService = new ConversionService();
    }

    public async convertFile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'Nenhum arquivo enviado' });
                return;
            }

            const { targetFormat } = req.body;
            
            if (!targetFormat) {
                res.status(400).json({ error: 'Formato de destino não especificado' });
                return;
            }

            console.log(`Iniciando conversão do arquivo ${req.file.originalname} para ${targetFormat}`);
            
            const convertedFilePath = await this.conversionService.convertFile(req.file, targetFormat);
            
            console.log(`Arquivo convertido com sucesso: ${convertedFilePath}`);
            
            res.status(200).json({
                message: 'Arquivo convertido com sucesso',
                fileName: path.basename(convertedFilePath),
            });
        } catch (error) {
            console.error('Erro durante a conversão:', error);
            res.status(500).json({ error: 'Erro durante a conversão do arquivo' });
        }
    }

    public async downloadFile(req: Request, res: Response): Promise<void> {
        try {
            const { fileName } = req.params;
            const filePath = path.join(process.cwd(), 'converted', fileName);

            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Erro ao baixar arquivo:', err);
                    res.status(404).json({ error: 'Arquivo não encontrado' });
                }
            });
        } catch (error) {
            console.error('Erro ao processar download:', error);
            res.status(500).json({ error: 'Erro ao processar download do arquivo' });
        }
    }

    public async getSupportedFormats(req: Request, res: Response): Promise<void> {
        try {
            const formats = {
                image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                video: ['mp4', 'avi', 'mov', 'webm'],
            };
            
            res.status(200).json(formats);
        } catch (error) {
            console.error('Erro ao obter formatos suportados:', error);
            res.status(500).json({ error: 'Erro ao obter formatos suportados' });
        }
    }
} 