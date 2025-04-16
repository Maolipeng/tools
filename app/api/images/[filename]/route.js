import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// 图片存储目录
const IMAGES_DIR = path.join(process.cwd(), 'public', 'uploads');

// 获取图片内容
export async function GET(request, { params }) {
  try {
    const { filename } = params;
    
    // 安全检查：防止目录遍历攻击
    if (filename.includes('..') || filename.includes('/')) {
      return new NextResponse('无效的文件名', { status: 400 });
    }
    
    const filepath = path.join(IMAGES_DIR, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filepath)) {
      return new NextResponse('图片不存在', { status: 404 });
    }
    
    // 读取文件内容
    const fileBuffer = fs.readFileSync(filepath);
    
    // 根据文件扩展名确定MIME类型
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // 默认
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.bmp':
        contentType = 'image/bmp';
        break;
      case '.ico':
        contentType = 'image/x-icon';
        break;
      case '.tiff':
      case '.tif':
        contentType = 'image/tiff';
        break;
    }
    
    // 返回图片内容
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 缓存一年
      },
    });
  } catch (error) {
    console.error('获取图片错误:', error);
    return new NextResponse('服务器错误', { status: 500 });
  }
}