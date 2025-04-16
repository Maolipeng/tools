'use client';

import React, { useState, useEffect, useRef } from 'react';
import { message, Typography } from 'antd';

const { Link } = Typography;

const ImageGenerator = () => {
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [imageType, setImageType] = useState('svg');
  const [backgroundColor, setBackgroundColor] = useState('#cccccc');
  const [textColor, setTextColor] = useState('#333333');
  const [showBorder, setShowBorder] = useState(true);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const canvasRef = useRef(null);
  
  // 自定义图片上传相关状态
  const [uploadedImage, setUploadedImage] = useState(null);
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [cropSettings, setCropSettings] = useState({
    x: 0,
    y: 0,
    cropWidth: 0,
    cropHeight: 0,
    isDragging: false,
    isResizing: false,
    resizeHandle: '',
    startX: 0,
    startY: 0,
    scale: 1 // 用于缩放显示
  });
  const imageRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const cropContainerRef = useRef(null);

  // 支持的图片类型
  const imageTypes = [
    { value: 'svg', label: 'SVG' },
    { value: 'png', label: 'PNG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'webp', label: 'WebP' },
    { value: 'gif', label: 'GIF' },
    { value: 'bmp', label: 'BMP' },
    { value: 'tiff', label: 'TIFF' },
    { value: 'ico', label: 'ICO' }
  ];
  
  // 处理图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage({
            src: event.target.result,
            width: img.width,
            height: img.height
          });
          
          // 计算适合容器的缩放比例
          let scale = 1;
          const containerWidth = cropContainerRef.current ? cropContainerRef.current.clientWidth : 500;
          if (img.width > containerWidth) {
            scale = containerWidth / img.width;
          }
          
          // 设置初始裁剪区域为目标尺寸或者图片大小的一部分
          const cropW = Math.min(width, img.width * 0.8);
          const cropH = Math.min(height, img.height * 0.8);
          const cropX = (img.width - cropW) / 2;
          const cropY = (img.height - cropH) / 2;
          
          setCropSettings(prev => ({
            ...prev,
            cropWidth: cropW,
            cropHeight: cropH,
            x: cropX,
            y: cropY,
            scale: scale
          }));
          
          setUseCustomImage(true);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // 生成图片的函数
  const generateImage = () => {
    if (useCustomImage) {
      generateCroppedImage();
    } else if (imageType === 'svg') {
      generateSvgImage();
    } else {
      generateCanvasImage();
    }
  };
  
  // 检查鼠标是否在调整大小的把手上
  const checkResizeHandles = (mouseX, mouseY, x, y, width, height) => {
    const { scale } = cropSettings;
    const handleSize = 10; // 调整大小把手的尺寸
    const scaledX = x * scale;
    const scaledY = y * scale;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    // 检查8个调整大小的把手
    // 左上角
    if (Math.abs(mouseX - scaledX) <= handleSize && Math.abs(mouseY - scaledY) <= handleSize) {
      return 'nw-resize';
    }
    // 上边中心
    if (Math.abs(mouseX - (scaledX + scaledWidth/2)) <= handleSize && Math.abs(mouseY - scaledY) <= handleSize) {
      return 'n-resize';
    }
    // 右上角
    if (Math.abs(mouseX - (scaledX + scaledWidth)) <= handleSize && Math.abs(mouseY - scaledY) <= handleSize) {
      return 'ne-resize';
    }
    // 右边中心
    if (Math.abs(mouseX - (scaledX + scaledWidth)) <= handleSize && Math.abs(mouseY - (scaledY + scaledHeight/2)) <= handleSize) {
      return 'e-resize';
    }
    // 右下角
    if (Math.abs(mouseX - (scaledX + scaledWidth)) <= handleSize && Math.abs(mouseY - (scaledY + scaledHeight)) <= handleSize) {
      return 'se-resize';
    }
    // 下边中心
    if (Math.abs(mouseX - (scaledX + scaledWidth/2)) <= handleSize && Math.abs(mouseY - (scaledY + scaledHeight)) <= handleSize) {
      return 's-resize';
    }
    // 左下角
    if (Math.abs(mouseX - scaledX) <= handleSize && Math.abs(mouseY - (scaledY + scaledHeight)) <= handleSize) {
      return 'sw-resize';
    }
    // 左边中心
    if (Math.abs(mouseX - scaledX) <= handleSize && Math.abs(mouseY - (scaledY + scaledHeight/2)) <= handleSize) {
      return 'w-resize';
    }
    
    return '';
  };
  
  // 处理裁剪区域交互开始
  const handleCropDragStart = (e) => {
    if (!uploadedImage) return;
    
    const container = cropContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const { x, y, cropWidth, cropHeight, scale } = cropSettings;
    const scaledX = x * scale;
    const scaledY = y * scale;
    const scaledWidth = cropWidth * scale;
    const scaledHeight = cropHeight * scale;
    
    // 检查是否在调整大小的把手上
    const resizeHandle = checkResizeHandles(mouseX, mouseY, x, y, cropWidth, cropHeight);
    
    if (resizeHandle) {
      // 开始调整大小
      setCropSettings(prev => ({
        ...prev,
        isResizing: true,
        resizeHandle: resizeHandle,
        startX: mouseX,
        startY: mouseY
      }));
      return;
    }
    
    // 检查是否在裁剪区域内点击
    if (
      mouseX >= scaledX && 
      mouseX <= scaledX + scaledWidth && 
      mouseY >= scaledY && 
      mouseY <= scaledY + scaledHeight
    ) {
      setCropSettings(prev => ({
        ...prev,
        isDragging: true,
        startX: mouseX - scaledX,
        startY: mouseY - scaledY
      }));
    }
  };
  
  // 处理裁剪区域交互
  const handleCropDrag = (e) => {
    if ((!cropSettings.isDragging && !cropSettings.isResizing) || !uploadedImage) return;
    
    const container = cropContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { scale } = cropSettings;
    
    if (cropSettings.isResizing) {
      // 处理调整大小
      const { resizeHandle, startX, startY, x, y, cropWidth, cropHeight } = cropSettings;
      const deltaX = (mouseX - startX) / scale;
      const deltaY = (mouseY - startY) / scale;
      
      let newX = x;
      let newY = y;
      let newWidth = cropWidth;
      let newHeight = cropHeight;
      
      // 根据不同的调整把手计算新的尺寸和位置
      switch (resizeHandle) {
        case 'nw-resize': // 左上角
          newX = Math.max(0, x + deltaX);
          newY = Math.max(0, y + deltaY);
          newWidth = Math.max(20, cropWidth - deltaX);
          newHeight = Math.max(20, cropHeight - deltaY);
          break;
        case 'n-resize': // 上边中心
          newY = Math.max(0, y + deltaY);
          newHeight = Math.max(20, cropHeight - deltaY);
          break;
        case 'ne-resize': // 右上角
          newY = Math.max(0, y + deltaY);
          newWidth = Math.max(20, cropWidth + deltaX);
          newHeight = Math.max(20, cropHeight - deltaY);
          break;
        case 'e-resize': // 右边中心
          newWidth = Math.max(20, cropWidth + deltaX);
          break;
        case 'se-resize': // 右下角
          newWidth = Math.max(20, cropWidth + deltaX);
          newHeight = Math.max(20, cropHeight + deltaY);
          break;
        case 's-resize': // 下边中心
          newHeight = Math.max(20, cropHeight + deltaY);
          break;
        case 'sw-resize': // 左下角
          newX = Math.max(0, x + deltaX);
          newWidth = Math.max(20, cropWidth - deltaX);
          newHeight = Math.max(20, cropHeight + deltaY);
          break;
        case 'w-resize': // 左边中心
          newX = Math.max(0, x + deltaX);
          newWidth = Math.max(20, cropWidth - deltaX);
          break;
      }
      
      // 限制边界
      if (newX + newWidth > uploadedImage.width) {
        newWidth = uploadedImage.width - newX;
      }
      if (newY + newHeight > uploadedImage.height) {
        newHeight = uploadedImage.height - newY;
      }
      
      setCropSettings(prev => ({
        ...prev,
        x: newX,
        y: newY,
        cropWidth: newWidth,
        cropHeight: newHeight,
        startX: mouseX,
        startY: mouseY
      }));
      
    } else if (cropSettings.isDragging) {
      // 处理拖动
      let newX = (mouseX - cropSettings.startX) / scale;
      let newY = (mouseY - cropSettings.startY) / scale;
      
      // 限制边界
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + cropSettings.cropWidth > uploadedImage.width) {
        newX = uploadedImage.width - cropSettings.cropWidth;
      }
      if (newY + cropSettings.cropHeight > uploadedImage.height) {
        newY = uploadedImage.height - cropSettings.cropHeight;
      }
      
      setCropSettings(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    }
  };
  
  // 处理裁剪区域交互结束
  const handleCropDragEnd = () => {
    if (!uploadedImage) return;
    
    setCropSettings(prev => ({
      ...prev,
      isDragging: false,
      isResizing: false,
      resizeHandle: ''
    }));
  };
  
  // 获取鼠标在裁剪区域上的光标样式
  const getCropCursor = (e) => {
    if (!uploadedImage || !cropContainerRef.current) return 'default';
    
    const container = cropContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const { x, y, cropWidth, cropHeight, scale } = cropSettings;
    const scaledX = x * scale;
    const scaledY = y * scale;
    const scaledWidth = cropWidth * scale;
    const scaledHeight = cropHeight * scale;
    
    // 检查是否在调整大小的把手上
    const resizeHandle = checkResizeHandles(mouseX, mouseY, x, y, cropWidth, cropHeight);
    if (resizeHandle) {
      return resizeHandle;
    }
    
    // 检查是否在裁剪区域内
    if (
      mouseX >= scaledX && 
      mouseX <= scaledX + scaledWidth && 
      mouseY >= scaledY && 
      mouseY <= scaledY + scaledHeight
    ) {
      return 'move';
    }
    
    return 'crosshair';
  };

  // 生成SVG图片
  const generateSvgImage = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="${backgroundColor}" />
        ${showBorder ? `<rect width="${width-2}" height="${height-2}" x="1" y="1" fill="none" stroke="#000000" stroke-width="1" />` : ''}
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" 
              dominant-baseline="middle" text-anchor="middle">${width} × ${height}</text>
      </svg>
    `;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setGeneratedImageUrl(url);
  };

  // 生成Canvas图片（PNG, JPEG, WebP）
  const generateCanvasImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 绘制背景
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制边框
    if (showBorder) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, width-2, height-2);
    }
    
    // 绘制尺寸文本
    ctx.fillStyle = textColor;
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${width} × ${height}`, width/2, height/2);
    
    // 转换为指定类型的图片URL
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setGeneratedImageUrl(url);
    }, `image/${imageType}`);
  };
  
  // 生成裁剪后的图片
  const generateCroppedImage = () => {
    if (!uploadedImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸为目标尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制裁剪后的图片并缩放到目标尺寸
    const img = new Image();
    img.onload = () => {
      // 绘制底色（可选）
      if (showBorder) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
      
      ctx.drawImage(
        img,
        cropSettings.x,
        cropSettings.y,
        cropSettings.cropWidth,
        cropSettings.cropHeight,
        0,
        0,
        width,
        height
      );
      
      // 如果需要显示边框
      if (showBorder) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, width-2, height-2);
      }
      
      // 转换为指定类型的图片URL
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setGeneratedImageUrl(url);
      }, `image/${imageType}`);
    };
    img.src = uploadedImage.src;
  };

  // 保存图片到服务器
  const [serverImageUrl, setServerImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadImage = async () => {
    if (!generatedImageUrl) return;

    setUploading(true);
    try {
      // 从 Data URL 转换为 Blob
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();

      // 创建表单数据
      const formData = new FormData();
      formData.append('file', blob, `image.${imageType}`);
      formData.append('imageType', imageType);

      // 上传到服务器
      const uploadResponse = await fetch('/api/images', {
        method: 'POST',
        body: formData
      });

      const data = await uploadResponse.json();
      if (data.error) throw new Error(data.error);

      setServerImageUrl(data.url);
      message.success('图片已保存到服务器');
    } catch (error) {
      message.error('保存失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 下载图片
  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `test-image-${width}x${height}.${imageType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 复制服务器图片链接
  const copyImageUrl = () => {
    if (!serverImageUrl) return;
    const fullUrl = `${window.location.origin}${serverImageUrl}`;
    
    // 检查clipboard API是否可用
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl)
        .then(() => message.success('链接已复制到剪贴板'))
        .catch(() => fallbackCopyToClipboard(fullUrl));
    } else {
      fallbackCopyToClipboard(fullUrl);
    }
  };

  // 降级复制方案
  const fallbackCopyToClipboard = (text) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      message.success('链接已复制到剪贴板');
    } catch (err) {
      message.error('复制失败，请手动复制');
    }
  };
  
  // 获取图片完整URL
  const getFullImageUrl = (url) => {
    if (!url) return '';
    return `${window.location.origin}${url}`;
  };

  // 当尺寸或类型改变时，自动重新生成图片
  useEffect(() => {
    generateImage();
    // 清理函数
    return () => {
      if (generatedImageUrl) {
        URL.revokeObjectURL(generatedImageUrl);
      }
    };
  }, [width, height, imageType, backgroundColor, textColor, showBorder]);
  
  // 渲染裁剪框
  const renderCropOverlay = () => {
    if (!uploadedImage || !cropContainerRef.current) return null;
    
    const { x, y, cropWidth, cropHeight, scale } = cropSettings;
    const scaledX = x * scale;
    const scaledY = y * scale;
    const scaledWidth = cropWidth * scale;
    const scaledHeight = cropHeight * scale;
    
    // 绘制裁剪框和网格线
    return (
      <div 
        className="absolute left-0 top-0 right-0 bottom-0 overflow-hidden"
        style={{ cursor: cropSettings.isDragging ? 'move' : cropSettings.isResizing ? cropSettings.resizeHandle : 'default' }}
        onMouseDown={handleCropDragStart}
        onMouseMove={(e) => {
          handleCropDrag(e);
          e.currentTarget.style.cursor = getCropCursor(e);
        }}
        onMouseUp={handleCropDragEnd}
        onMouseLeave={handleCropDragEnd}
      >
        {/* 半透明遮罩层 */}
        <div className="absolute left-0 top-0 right-0 bottom-0 bg-black bg-opacity-50"></div>
        
        {/* 裁剪框 */}
        <div 
          className="absolute border-2 border-white"
          style={{
            left: `${scaledX}px`,
            top: `${scaledY}px`,
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          {/* 裁剪框网格线 */}
          <div className="w-full h-full">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white bg-opacity-50"></div>
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white bg-opacity-50"></div>
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white bg-opacity-50"></div>
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white bg-opacity-50"></div>
          </div>
          
          {/* 调整大小的8个把手 */}
          <div className="absolute left-0 top-0 w-2 h-2 bg-white cursor-nw-resize -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 w-2 h-2 bg-white cursor-n-resize -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute right-0 top-0 w-2 h-2 bg-white cursor-ne-resize translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute right-0 top-1/2 w-2 h-2 bg-white cursor-e-resize translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute right-0 bottom-0 w-2 h-2 bg-white cursor-se-resize translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute left-1/2 bottom-0 w-2 h-2 bg-white cursor-s-resize -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-2 h-2 bg-white cursor-sw-resize -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute left-0 top-1/2 w-2 h-2 bg-white cursor-w-resize -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">测试图片生成器</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">配置</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <button
                onClick={downloadImage}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!generatedImageUrl}
              >
                下载图片
              </button>
              <button
                onClick={uploadImage}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={!generatedImageUrl || uploading}
              >
                {uploading ? '保存中...' : '保存到服务器'}
              </button>
            </div>
            {serverImageUrl && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium mb-2">服务器图片链接：</p>
                <Link copyable>{getFullImageUrl(serverImageUrl)}</Link>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">宽度 (px)</label>
                <input
                  type="number"
                  min="1"
                  max="3000"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">高度 (px)</label>
                <input
                  type="number"
                  min="1"
                  max="3000"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">图片类型</label>
              <select
                value={imageType}
                onChange={(e) => setImageType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {imageTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 自定义图片上传 */}
            <div>
              <label className="block text-sm font-medium mb-1">上传自定义图片</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded"
              />
            </div>
            
            {/* 图片来源切换 */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomImage}
                  onChange={(e) => setUseCustomImage(e.target.checked)}
                  disabled={!uploadedImage}
                  className="mr-2"
                />
                <span className="text-sm font-medium">使用上传的图片</span>
              </label>
            </div>
            
            {/* 只在使用生成图片模式时显示颜色设置 */}
            {!useCustomImage && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">背景颜色</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="mr-2 w-10 h-10 cursor-pointer"
                        style={{ padding: '0' }}
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">文字颜色</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="mr-2 w-10 h-10 cursor-pointer"
                        style={{ padding: '0' }}
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBorder}
                      onChange={(e) => setShowBorder(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">显示边框</span>
                  </label>
                </div>
              </>
            )}
            
            <button
              onClick={generateImage}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              重新生成
            </button>
            
            <button
              onClick={downloadImage}
              disabled={!generatedImageUrl}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              下载图片
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">预览</h2>
          
          {/* 裁剪区域预览 - 仅在使用自定义图片时显示 */}
          {useCustomImage && uploadedImage && (
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">裁剪区域调整</h3>
              <p className="text-sm text-gray-600 mb-2">拖动裁剪框或调整边角手柄来裁剪图片</p>
              <div 
                ref={cropContainerRef}
                className="relative border overflow-hidden" 
                style={{ 
                  maxHeight: '400px',
                  height: `${uploadedImage.height * cropSettings.scale}px`,
                  width: `${uploadedImage.width * cropSettings.scale}px`,
                  maxWidth: '100%'
                }}
              >
                {/* 显示原始图片 */}
                <img
                  src={uploadedImage.src}
                  alt="上传图片"
                  style={{
                    width: `${uploadedImage.width * cropSettings.scale}px`,
                    height: `${uploadedImage.height * cropSettings.scale}px`
                  }}
                />
                
                {/* 渲染裁剪框覆盖层 */}
                {renderCropOverlay()}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-xs font-medium mb-1">裁剪位置 X</label>
                  <input
                    type="number"
                    min="0"
                    max={uploadedImage ? uploadedImage.width - 10 : 1000}
                    value={Math.round(cropSettings.x)}
                    onChange={(e) => setCropSettings(prev => ({
                      ...prev,
                      x: Number(e.target.value)
                    }))}
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">裁剪位置 Y</label>
                  <input
                    type="number"
                    min="0"
                    max={uploadedImage ? uploadedImage.height - 10 : 1000}
                    value={Math.round(cropSettings.y)}
                    onChange={(e) => setCropSettings(prev => ({
                      ...prev,
                      y: Number(e.target.value)
                    }))}
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">裁剪宽度</label>
                  <input
                    type="number"
                    min="10"
                    max={uploadedImage ? uploadedImage.width : 1000}
                    value={Math.round(cropSettings.cropWidth)}
                    onChange={(e) => setCropSettings(prev => ({
                      ...prev,
                      cropWidth: Number(e.target.value)
                    }))}
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">裁剪高度</label>
                  <input
                    type="number"
                    min="10"
                    max={uploadedImage ? uploadedImage.height : 1000}
                    value={Math.round(cropSettings.cropHeight)}
                    onChange={(e) => setCropSettings(prev => ({
                      ...prev,
                      cropHeight: Number(e.target.value)
                    }))}
                    className="w-full p-1 text-sm border rounded"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* 最终图片预览 */}
          <div className="border p-4 flex items-center justify-center overflow-auto" style={{ minHeight: '200px' }}>
            {generatedImageUrl && (
              <img
                ref={imageRef}
                src={generatedImageUrl}
                alt={`测试图片 ${width}x${height}`}
                style={{ maxWidth: '100%' }}
              />
            )}
          </div>
          
          {/* 服务器图片预览 */}
          {serverImageUrl && (
            <div className="mt-4 border p-4 bg-gray-50 flex justify-center">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">服务器图片预览</p>
                <img
                  src={getFullImageUrl(serverImageUrl)}
                  alt="服务器图片"
                  className="max-w-full max-h-[400px] object-contain"
                />
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p>图片信息: {width} × {height} 像素, {imageTypes.find(t => t.value === imageType)?.label}</p>
            {useCustomImage && uploadedImage && (
              <p className="mt-1">原始图片: {uploadedImage.width} × {uploadedImage.height} 像素</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 隐藏的Canvas元素用于图像生成 */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default ImageGenerator;