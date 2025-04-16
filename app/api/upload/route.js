import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const relativePath = formData.get('path');
    const targetDir = formData.get('targetDir');
    
    if (!targetDir) {
      return new Response(JSON.stringify({ message: '上传失败', error: '目标目录不能为空' }), { status: 400 });
    }

    // 移除根目录，只保留子目录结构
    const pathParts = relativePath.split(path.sep);
    const subPath = pathParts.length > 1 ? pathParts.slice(1).join(path.sep) : relativePath;
    
    // 使用处理后的相对路径
    const targetPath = path.join(targetDir, subPath);

    // 确保目标目录存在
    const targetDirPath = path.dirname(targetPath);
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }

    // 保存文件
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetPath, buffer);

    return new Response(JSON.stringify({ message: '上传成功' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: '上传失败', error: error.message }), { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};