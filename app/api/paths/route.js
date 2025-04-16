import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'config.json');

// 确保配置文件存在
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({
    paths: [
      { label: '达人营销平台', value: '/opt/fe-project/axure' }
    ]
  }));
}

// 获取路径列表
export async function GET() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return NextResponse.json(config.paths);
  } catch (error) {
    return NextResponse.json({ error: '获取路径配置失败' }, { status: 500 });
  }
}

// 新增路径
export async function POST(request) {
  try {
    const { label, value } = await request.json();
    if (!label || !value) {
      return NextResponse.json({ error: '标签和路径都不能为空' }, { status: 400 });
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // 检查是否已存在相同的路径
    if (config.paths.some(path => path.value === value)) {
      return NextResponse.json({ error: '该路径已存在' }, { status: 400 });
    }

    config.paths.push({ label, value });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return NextResponse.json(config.paths);
  } catch (error) {
    return NextResponse.json({ error: '添加路径失败' }, { status: 500 });
  }
}