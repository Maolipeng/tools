import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 从请求参数中获取目标目录
const getTargetDir = (searchParams) => {
  const targetDir = searchParams.get('targetDir');
  if (!targetDir) {
    throw new Error('目标目录不能为空');
  }
  return targetDir;
};

const getFileMetadata = (filePath, targetDir) => {
  const stats = fs.statSync(filePath);
  const fileContent = fs.readFileSync(filePath);
  const md5 = crypto.createHash('md5').update(fileContent).digest('hex');
  return {
    path: path.relative(targetDir, filePath),
    mtime: stats.mtimeMs,
    md5,
  };
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetDir = getTargetDir(searchParams);
    const files = [];
    const walkSync = (dir) => {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
          walkSync(fullPath);
        } else {
          files.push(getFileMetadata(fullPath, targetDir));
        }
      });
    };
    walkSync(targetDir);
    return new Response(JSON.stringify(files), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: '无法获取文件列表', error: error.message }), { status: 500 });
  }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const targetDir = getTargetDir(searchParams);
  try {
    const { files } = await request.json();
    files.forEach(filePath => {
      const fullPath = path.join(targetDir, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });
    return new Response(JSON.stringify({ message: '删除成功' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: '删除失败', error: error.message }), { status: 500 });
  }
}