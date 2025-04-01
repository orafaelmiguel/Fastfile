import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { PSD } from 'psd';
import exifr from 'exifr';

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
                    outputBuffer = await sharpInstance.jpeg({ quality: 90 }).toBuffer();
                    break;
                case 'png':
                    outputBuffer = await sharpInstance.png().toBuffer();
                    break;
                case 'tiff':
                    outputBuffer = await sharpInstance.tiff().toBuffer();
                    break;
                case 'webp':
                    outputBuffer = await sharpInstance.webp().toBuffer();
                    break;
                case 'svg':
                    const pngBuffer = await sharpInstance.png().toBuffer();
                    outputBuffer = await this.convertToSVG(pngBuffer);
                    break;
                case 'raw':
                    outputBuffer = buffer;
                    break;
                case 'img':
                    outputBuffer = await sharpInstance.toBuffer();
                    break;
                case 'psd':
                    outputBuffer = await this.convertToPSD(buffer);
                    break;
                case 'exif':
                    outputBuffer = await this.convertToEXIF(buffer);
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

    private async convertToSVG(buffer: Buffer): Promise<Buffer> {
        // Implementação da conversão para SVG usando uma biblioteca de processamento de imagens
        // Por enquanto, vamos retornar um SVG básico com a imagem em base64
        const base64Image = buffer.toString('base64');
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
                <image href="data:image/png;base64,${base64Image}" width="100%" height="100%"/>
            </svg>
        `;
        return Buffer.from(svgContent);
    }

    private async convertToPSD(buffer: Buffer): Promise<Buffer> {
        // Implementação da conversão para PSD usando uma biblioteca específica
        // Por enquanto, vamos converter para PNG com metadados PSD
        const pngBuffer = await sharp(buffer)
            .png()
            .withMetadata()
            .toBuffer();
        
        // Adicionar cabeçalho PSD
        const psdHeader = Buffer.from([
            0x38, 0x42, 0x50, 0x53, // "8BPS" signature
            0x00, 0x01,             // Version
            0x00, 0x06,             // Number of channels
            0x00, 0x00, 0x00, 0x00, // Height
            0x00, 0x00, 0x00, 0x00, // Width
            0x00, 0x00,             // Depth
            0x00, 0x03              // Color mode (RGB)
        ]);

        return Buffer.concat([psdHeader, pngBuffer]);
    }

    private async convertToEXIF(buffer: Buffer): Promise<Buffer> {
        // Para EXIF, vamos preservar os metadados originais
        const metadata = await sharp(buffer).metadata();
        
        // Criar uma nova imagem com os metadados EXIF
        return await sharp(buffer)
            .withMetadata(metadata)
            .jpeg({ quality: 100 })
            .toBuffer();
    }

    private async convertVideo(buffer: Buffer, targetFormat: string): Promise<Buffer> {
        console.log('Starting video conversion...');
        return new Promise((resolve, reject) => {
            const format = targetFormat.toLowerCase();
            const tempInputStream = require('stream').Readable.from(buffer);
            const tempOutputStream = require('stream').Writable();

            let command = ffmpeg();

            try {
                switch (format) {
                    case 'mp4':
                        command = command
                            .toFormat('mp4')
                            .videoCodec('libx264')
                            .audioCodec('aac');
                        break;
                    case 'mov':
                        command = command
                            .toFormat('mov')
                            .videoCodec('libx264')
                            .audioCodec('aac');
                        break;
                    case 'avi':
                        command = command
                            .toFormat('avi')
                            .videoCodec('libx264')
                            .audioCodec('aac');
                        break;
                    case 'wmv':
                        command = command
                            .toFormat('wmv')
                            .videoCodec('wmv2')
                            .audioCodec('wmav2');
                        break;
                    case 'mkv':
                        command = command
                            .toFormat('matroska')
                            .videoCodec('libx264')
                            .audioCodec('aac');
                        break;
                    case 'flv':
                        command = command
                            .toFormat('flv')
                            .videoCodec('libx264')
                            .audioCodec('aac');
                        break;
                    case 'f4v':
                        command = command
                            .toFormat('f4v')
                            .videoCodec('libx264')
                            .audioCodec('aac');
                        break;
                    case 'swf':
                        command = command
                            .toFormat('swf')
                            .videoCodec('flv1')
                            .audioCodec('mp3');
                        break;
                    case 'webm':
                        command = command
                            .toFormat('webm')
                            .videoCodec('libvpx-vp9')
                            .audioCodec('libopus');
                        break;
                    case 'html':
                        // Para HTML, vamos criar um player de vídeo simples
                        const htmlContent = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Video Player</title>
                                <style>
                                    body { margin: 0; background: #000; }
                                    video { width: 100%; height: 100vh; }
                                </style>
                            </head>
                            <body>
                                <video controls>
                                    <source src="data:video/mp4;base64,${buffer.toString('base64')}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </body>
                            </html>
                        `;
                        resolve(Buffer.from(htmlContent));
                        return;
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