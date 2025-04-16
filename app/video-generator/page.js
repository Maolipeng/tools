'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './page.module.css';
import {
  drawColorBars,
  drawColorBlocks,
  drawGradient,
  drawTimeCode,
  drawCountdown,
  drawCheckerboard,
  drawNoise,
  drawImagePattern // Import the new function
} from './drawUtils';

export default function VideoGenerator() {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formatInfo, setFormatInfo] = useState('选择参数后点击"生成视频"');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedMimeType, setSelectedMimeType] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded image
  const [imageMotionType, setImageMotionType] = useState('scroll'); // State for image motion
  const [selectedPattern, setSelectedPattern] = useState('colorbars'); // State for selected pattern

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const fileInputRef = useRef(null); // Ref for file input

  // 检测支持的格式
  const getSupportedMimeType = (formatChoice) => {
    const types = [];

    if (formatChoice === 'auto' || formatChoice === 'webm-vp9') {
      types.push('video/webm;codecs=vp9');
    }
    if (formatChoice === 'auto' || formatChoice === 'webm-vp8') {
      types.push('video/webm;codecs=vp8');
      types.push('video/webm');
    }
    if (formatChoice === 'auto' || formatChoice === 'mp4') {
      types.push('video/mp4;codecs=avc1.42E01E');
      types.push('video/mp4');
    }

    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm';
  };

  const handleFormatChange = (e) => {
    try {
      const mimeType = getSupportedMimeType(e.target.value);
      setFormatInfo(`支持的格式: ${mimeType}`);
      setSelectedMimeType(mimeType);
    } catch (err) {
      setFormatInfo('浏览器不支持 MediaRecorder API');
    }
  };

  const handlePatternChange = (e) => {
    const newPattern = e.target.value;
    setSelectedPattern(newPattern);
    // If switching away from image pattern, clear the image
    if (newPattern !== 'image' && uploadedImage) {
      // Optional: Clear image state if switching away from image pattern
      // setUploadedImage(null);
      // if (fileInputRef.current) {
      //   fileInputRef.current.value = '';
      // }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            setUploadedImage(img);
            setSelectedPattern('image'); // Automatically switch to image pattern on upload
        };
        img.onerror = () => {
          alert('无法加载图片文件');
          setUploadedImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
          }
        };
        img.src = event.target.result;
      };
      reader.onerror = () => {
        alert('读取文件时出错');
        setUploadedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedImage(null);
    }
  };

  const generateVideo = async () => {
    if (isRecording) return;

    // Use state for pattern
    if (selectedPattern === 'image' && !uploadedImage) {
      alert('请先上传一张图片，或选择其他测试模式');
      return;
    }

    try {
      // 重置状态
      recordedChunksRef.current = [];
      setVideoUrl('');
      setProgress(0);
      setIsRecording(true);

      // 获取参数
      const width = parseInt(document.getElementById('width').value);
      const height = parseInt(document.getElementById('height').value);
      const duration = parseInt(document.getElementById('duration').value);
      const framerate = parseInt(document.getElementById('framerate').value);
      const text = document.getElementById('text').value;
      const currentImageMotionType = imageMotionType; // Use state value
      const currentPattern = selectedPattern; // Use state value

      // 设置画布
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 创建媒体流
      const stream = canvas.captureStream(framerate);

      // 配置MediaRecorder
      const options = { mimeType: selectedMimeType, videoBitsPerSecond: 5000000 };
      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const fileExtension = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recordedChunksRef.current, { type: selectedMimeType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsRecording(false);
        setFormatInfo(`视频生成完成 - ${width}x${height} - ${fileExtension.toUpperCase()} 格式`);
      };

      // 开始录制
      mediaRecorderRef.current.start();

      // 计算总帧数
      const totalFrames = duration * framerate;

      // 绘制每一帧
      for (let i = 0; i < totalFrames; i++) {
        const progress = Math.floor((i / totalFrames) * 100);
        setProgress(progress);

        const time = i / framerate;
        ctx.clearRect(0, 0, width, height);

        // 根据选择的模式绘制内容 (use state)
        switch (currentPattern) {
          case 'colorbars':
            drawColorBars(ctx, width, height);
            break;
          case 'colorblocks':
            drawColorBlocks(ctx, width, height, time);
            break;
          case 'gradient':
            drawGradient(ctx, width, height, time);
            break;
          case 'timecode':
            drawTimeCode(ctx, width, height, time);
            break;
          case 'countdown':
            drawCountdown(ctx, width, height, time, duration);
            break;
          case 'checkerboard':
            drawCheckerboard(ctx, width, height, time);
            break;
          case 'noise':
            drawNoise(ctx, width, height, time);
            break;
          case 'image': // Add image pattern case
            if (uploadedImage) {
              drawImagePattern(ctx, width, height, time, uploadedImage, currentImageMotionType);
            }
            break;
        }

        // 绘制分辨率信息
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = `${Math.max(height / 20, 16)}px Arial`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.strokeText(`${width}×${height}`, width - 10, height - 10);
        ctx.fillText(`${width}×${height}`, width - 10, height - 10);

        // 绘制自定义文本
        if (text) {
          ctx.font = `bold ${Math.max(height / 15, 20)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.strokeText(text, width / 2, 20);
          ctx.fillText(text, width / 2, 20);
        }

        await new Promise(resolve => setTimeout(resolve, 1000 / framerate));
      }

      mediaRecorderRef.current.stop();
      setProgress(100);

    } catch (error) {
      console.error('生成视频时出错:', error);
      alert('生成视频时出错: ' + error.message);
      setIsRecording(false);
      setFormatInfo('发生错误，请尝试不同的设置或浏览器');
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;

    const fileExtension = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;

    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `test-video-${width}x${height}.${fileExtension}`;
    a.click();
  };

  useEffect(() => {
    // 初始检测格式
    try {
      const mimeType = getSupportedMimeType('auto');
      setFormatInfo(`支持的格式: ${mimeType}`);
      setSelectedMimeType(mimeType);
    } catch (e) {
      setFormatInfo('浏览器不支持 MediaRecorder API');
    }
  }, []);

  return (
    <div className={styles.container}>
      <h1>多功能测试视频生成器</h1>

      <div className={styles.infoBox}>
        此工具可以生成各种测试视频，用于测试播放器、编码器或内容展示。格式支持基于浏览器能力，通常为WebM (VP8/VP9)。
      </div>

      <div className={styles.formGroup}>
        <div className={styles.row}>
          <div className={styles.col}>
            <label htmlFor="width">宽度 (像素)</label>
            <input type="number" id="width" defaultValue="640" min="128" max="1920" />
          </div>
          <div className={styles.col}>
            <label htmlFor="height">高度 (像素)</label>
            <input type="number" id="height" defaultValue="360" min="128" max="1080" />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.row}>
          <div className={styles.col}>
            <label htmlFor="duration">时长 (秒)</label>
            <input type="number" id="duration" defaultValue="5" min="1" max="30" />
          </div>
          <div className={styles.col}>
            <label htmlFor="framerate">帧率 (FPS)</label>
            <input type="number" id="framerate" defaultValue="30" min="1" max="60" />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.row}>
          <div className={styles.col}>
            <label htmlFor="pattern">测试模式</label>
            <select id="pattern" value={selectedPattern} onChange={handlePatternChange}>
              <option value="colorbars">SMPTE彩条</option>
              <option value="colorblocks">彩色块</option>
              <option value="gradient">渐变</option>
              <option value="timecode">时间码</option>
              <option value="countdown">倒计时</option>
              <option value="checkerboard">棋盘格</option>
              <option value="noise">噪点</option>
              <option value="image" disabled={!uploadedImage}>上传图片 (已上传)</option>
              <option value="image" disabled={uploadedImage}>上传图片 (未上传)</option>
            </select>
          </div>
          <div className={styles.col}>
            <label htmlFor="format">视频格式</label>
            <select id="format" onChange={handleFormatChange}>
              <option value="auto">自动选择 (推荐)</option>
              <option value="webm-vp9">WebM (VP9)</option>
              <option value="webm-vp8">WebM (VP8)</option>
              <option value="mp4">MP4 (如支持)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Image Upload Section - Conditionally enable/disable based on pattern? Or always allow upload? */}
      {/* Let's always allow upload, and automatically switch pattern */}
      <div className={styles.formGroup}>
        <label htmlFor="imageUpload">上传图片 (将自动切换到“上传图片”模式)</label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          // Disable if another pattern is explicitly selected?
          // disabled={selectedPattern !== 'image' && uploadedImage === null}
        />
        {/* Add image preview here */}
        {uploadedImage && (
          <div style={{ marginTop: '10px' }}>
            <p>图片预览:</p>
            <img
              src={uploadedImage.src} // Use the src from the Image object
              alt="Uploaded preview"
              style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ccc' }}
            />
          </div>
        )}
      </div>

      {/* Image Motion Selection - Only show if image pattern is selected */}
      {selectedPattern === 'image' && uploadedImage && (
        <div className={styles.formGroup}>
          <label htmlFor="imageMotion">图片运动方式</label>
          <select
            id="imageMotion"
            value={imageMotionType}
            onChange={(e) => setImageMotionType(e.target.value)}
          >
            <option value="scroll">滚动</option>
            <option value="flip">翻转</option>
            <option value="random">随机</option>
            {/* Add more motion types if needed */}
          </select>
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="text">叠加文本 (可选)</label>
        <input
          type="text"
          id="text"
          placeholder="在视频上显示的文本，如分辨率、版权信息等"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          onClick={generateVideo}
          disabled={isRecording}
        >
          {isRecording ? '生成中...' : '生成视频'}
        </button>
        <button
          onClick={downloadVideo}
          disabled={!videoUrl}
        >
          下载视频
        </button>
      </div>

      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.preview}>
        <p>{formatInfo}</p>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {videoUrl && (
          <video src={videoUrl} controls />
        )}
      </div>
    </div>
  );
}