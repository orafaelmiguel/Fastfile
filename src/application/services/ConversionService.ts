import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

export class ConversionService {
    async convertFile(file: Express.Multer.File, targetFormat: string): Promise<{ buffer: Buffer; fileName: string }> {
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

        try {
            let outputBuffer: Buffer;
            
            if (isImage) {
                console.log('Converting image...');
                outputBuffer = await this.convertImage(file.buffer, targetFormat);
            } else if (isVideo) {
                console.log('Converting video...');
                outputBuffer = await this.convertVideo(file.buffer, targetFormat);
            } else {
                throw new Error('Unsupported file type');
            }

            console.log('Conversion completed successfully');
            return { buffer: outputBuffer, fileName: outputFileName };
        } catch (error) {
            console.error('Conversion error:', error);
            throw new Error(`Conversion failed: ${error.message}`);
        }
    }

    private async convertImage(buffer: Buffer, targetFormat: string): Promise<Buffer> {
        console.log('Starting image conversion...');
        const format = targetFormat.toLowerCase();
        let sharpInstance = sharp(buffer);

        try {
            let outputBuffer: Buffer;
            switch (format) {
                case 'jpeg':
                case 'jpg':
                    outputBuffer = await sharpInstance.jpeg().toBuffer();
                    break;
                case 'png':
                    outputBuffer = await sharpInstance.png().toBuffer();
                    break;
                case 'gif':
                    outputBuffer = await sharpInstance.gif().toBuffer();
                    break;
                case 'webp':
                    outputBuffer = await sharpInstance.webp().toBuffer();
                    break;
                default:
                    throw new Error(`Unsupported image format: ${format}`);
            }
            console.log('Image conversion completed');
            return outputBuffer;
        } catch (error) {
            console.error('Image conversion error:', error);
            throw error;
        }
    }

    private async convertVideo(buffer: Buffer, targetFormat: string): Promise<Buffer> {
        console.log('Starting video conversion...');
        return new Promise((resolve, reject) => {
            const format = targetFormat.toLowerCase();
            const tempInputPath = `temp_${uuidv4()}`;
            const tempOutputPath = `temp_${uuidv4()}`;

            // Criar um arquivo temporário em memória para o FFmpeg
            const tempInputStream = require('stream').Readable.from(buffer);
            const tempOutputStream = require('stream').Writable();

            let command = ffmpeg();

            try {
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

                const chunks: Buffer[] = [];
                tempOutputStream._write = (chunk: Buffer, encoding: string, callback: Function) => {
                    chunks.push(chunk);
                    callback();
                };

                command
                    .input(tempInputStream)
                    .on('end', () => {
                        const outputBuffer = Buffer.concat(chunks);
                        resolve(outputBuffer);
                    })
                    .on('error', (err) => {
                        console.error('Video conversion error:', err);
                        reject(err);
                    })
                    .pipe(tempOutputStream);
            } catch (error) {
                console.error('Video conversion error:', error);
                reject(error);
            }
        });
    }
} 