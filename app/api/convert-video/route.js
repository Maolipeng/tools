import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Ensure the uploads and converted directories exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const CONVERTED_DIR = path.join(process.cwd(), 'converted');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(CONVERTED_DIR)) {
  fs.mkdirSync(CONVERTED_DIR, { recursive: true });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const format = formData.get('format');

    if (!file || !format) {
      return NextResponse.json({ error: 'Missing file or format' }, { status: 400 });
    }

    if (!(file instanceof Blob)) {
        return NextResponse.json({ error: 'Uploaded item is not a file' }, { status: 400 });
    }

    const originalFilename = file.name || 'uploaded_video';
    const fileExtension = path.extname(originalFilename);
    const baseFilename = path.basename(originalFilename, fileExtension);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const inputFilename = `${uniqueSuffix}${fileExtension}`;
    const outputFilename = `${baseFilename}-${uniqueSuffix}.${format}`;
    const inputPath = path.join(UPLOAD_DIR, inputFilename);
    const outputPath = path.join(CONVERTED_DIR, outputFilename);

    // Save the uploaded file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(inputPath, buffer);

    // --- FFmpeg Conversion --- 
    // Ensure ffmpeg is installed and accessible in your server's PATH
    // 根据分辨率设置视频尺寸
    const resolutionMap = {
      '1080p': '1920x1080',
      '720p': '1280x720',
      '480p': '854x480',
      '360p': '640x360'
    };

    const resolution = formData.get('resolution') || '1080p';
    const bitrate = formData.get('bitrate') || '2000k';
    const framerate = formData.get('framerate') || '30';
    const audioQuality = formData.get('audioQuality') || '192k';

    const videoSize = resolutionMap[resolution] || '1920x1080';

    const command = `ffmpeg -i "${inputPath}" -vf "scale=${videoSize}" -b:v ${bitrate} -r ${framerate} -b:a ${audioQuality} "${outputPath}"`;

    console.log(`Executing FFmpeg command: ${command}`);

    try {
        const { stdout, stderr } = await execPromise(command);
        console.log('FFmpeg stdout:', stdout);
        if (stderr) {
            console.error('FFmpeg stderr:', stderr);
            // Check if stderr contains actual errors or just warnings/info
            if (stderr.toLowerCase().includes('error')) {
                 // Clean up input file on error
                await fs.promises.unlink(inputPath);
                return NextResponse.json({ error: 'Video conversion failed.', details: stderr }, { status: 500 });
            }
        }
    } catch (error) {
        console.error('FFmpeg execution error:', error);
        // Clean up input file on error
        try { await fs.promises.unlink(inputPath); } catch (unlinkErr) { console.error('Error deleting input file after conversion failure:', unlinkErr); }
        return NextResponse.json({ error: 'Video conversion failed.', details: error.message }, { status: 500 });
    }
    // --- End FFmpeg Conversion --- 

    // Clean up the original uploaded file after successful conversion
    try {
        await fs.promises.unlink(inputPath);
    } catch (unlinkErr) {
        console.error('Error deleting input file after successful conversion:', unlinkErr);
        // Don't fail the request if cleanup fails, just log it.
    }

    // Return the path to the converted file
    const downloadUrl = `/api/files/${outputFilename}`;
    return NextResponse.json({ downloadUrl });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}