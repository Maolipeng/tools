import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONVERTED_DIR = path.join(process.cwd(), 'converted');

export async function GET(request, { params }) {
  try {
    const { filename } = params;
    const filePath = path.join(CONVERTED_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    const fileType = path.extname(filename).substring(1);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': `video/${fileType}`,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}