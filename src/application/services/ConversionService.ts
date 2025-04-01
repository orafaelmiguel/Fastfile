import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

export class ConversionService {
    private readonly uploadDir: string;
    private readonly outputDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.outputDir = path.join(process.cwd(), 'converted');
        console.log('Upload directory:', this.uploadDir);
        console.log('Output directory:', this.outputDir);
    }

    async convertFile(file: Express.Multer.File, targetFormat: string): Promise<string> {
        console.log('Starting conversion...');
        console.log('File:', file.originalname);
        console.log('MIME type:', file.mimetype);
        console.log('Target format:', targetFormat);

        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');

        console.log('File type:', isImage ? 'Image' : isVideo ? 'Video' : 'Unknown');

        if (!isImage && !isVideo) {
            throw new Error('Unsupported file type');
        }

        const outputFileName = `${uuidv4()}.${targetFormat.toLowerCase()}`;
        const outputPath = path.join(this.outputDir, outputFileName);

        console.log('Output path:', outputPath);

        try {
            // Criar diretório de saída se não existir
            await fs.mkdir(this.outputDir, { recursive: true });

            if (isImage) {
                console.log('Converting image...');
                await this.convertImage(file.buffer, outputPath, targetFormat);
            } else if (isVideo) {
                console.log('Converting video...');
                await this.convertVideo(file.buffer, outputPath, targetFormat);
            }

            console.log('Conversion completed successfully');
            return outputFileName;
        } catch (error) {
            console.error('Conversion error:', error);
            throw new Error(`Conversion failed: ${error.message}`);
        }
    }

    private async convertImage(buffer: Buffer, outputPath: string, targetFormat: string): Promise<void> {
        console.log('Starting image conversion...');
        const format = targetFormat.toLowerCase();
        let sharpInstance = sharp(buffer);

        try {
            switch (format) {
                case 'jpeg':
                case 'jpg':
                    await sharpInstance.jpeg().toFile(outputPath);
                    break;
                case 'png':
                    await sharpInstance.png().toFile(outputPath);
                    break;
                case 'gif':
                    await sharpInstance.gif().toFile(outputPath);
                    break;
                case 'webp':
                    await sharpInstance.webp().toFile(outputPath);
                    break;
                default:
                    throw new Error(`Unsupported image format: ${format}`);
            }
            console.log('Image conversion completed');
        } catch (error) {
            console.error('Image conversion error:', error);
            throw error;
        }
    }

    private async convertVideo(buffer: Buffer, outputPath: string, targetFormat: string): Promise<void> {
        console.log('Starting video conversion...');
        return new Promise((resolve, reject) => {
            const format = targetFormat.toLowerCase();
            let command = ffmpeg();

            try {
                // Criar um arquivo temporário para o buffer
                const tempInputPath = path.join(this.uploadDir, `${uuidv4()}_temp`);
                fs.writeFile(tempInputPath, buffer)
                    .then(() => {
                        command = ffmpeg(tempInputPath);

                        switch (format) {
                            case 'mp4':
                                command = command.toFormat('mp4');
                                break;
                            case 'mov':
                                command = command.toFormat('mov');
                                break;
                            case 'avi':
                                command = command.toFormat('avi');
                                break;
                            case 'webm':
                                command = command.toFormat('webm');
                                break;
                            default:
                                throw new Error(`Unsupported video format: ${format}`);
                        }

                        command
                            .on('end', () => {
                                console.log('Video conversion completed');
                                // Limpar arquivo temporário
                                fs.unlink(tempInputPath)
                                    .catch(err => console.error('Error deleting temp file:', err));
                                resolve();
                            })
                            .on('error', (err) => {
                                console.error('Video conversion error:', err);
                                // Limpar arquivo temporário em caso de erro
                                fs.unlink(tempInputPath)
                                    .catch(err => console.error('Error deleting temp file:', err));
                                reject(err);
                            })
                            .save(outputPath);
                    })
                    .catch(reject);
            } catch (error) {
                console.error('Video conversion error:', error);
                reject(error);
            }
        });
    }

    async getConvertedFilePath(fileName: string): Promise<string> {
        return path.join(this.outputDir, fileName);
    }

    async deleteConvertedFile(fileName: string): Promise<void> {
        const filePath = await this.getConvertedFilePath(fileName);
        try {
            await fs.unlink(filePath);
            console.log('Converted file deleted:', filePath);
        } catch (error) {
            console.error('Error deleting converted file:', error);
        }
    }
} 