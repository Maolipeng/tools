import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// 图片存储目录
const IMAGES_DIR = path.join(process.cwd(), 'public', 'uploads');

// 确保上传目录存在
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// 处理图片上传
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const imageType = formData.get('imageType');
    
    if (!file) {
      return NextResponse.json({ error: '没有找到图片文件' }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const filename = `image_${timestamp}.${imageType}`;
    const filepath = path.join(IMAGES_DIR, filename);

    // 保存文件
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // 返回可通过API访问的URL
    const imageUrl = `/api/images/${filename}`;
    
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}