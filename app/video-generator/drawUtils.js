// 绘制SMPTE彩条
export function drawColorBars(ctx, width, height) {
  const colors = [
    '#c0c0c0', // 75% 白
    '#c0c000', // 75% 黄
    '#00c0c0', // 75% 青
    '#00c000', // 75% 绿
    '#c000c0', // 75% 品红
    '#c00000', // 75% 红
    '#0000c0'  // 75% 蓝
  ];

  const barWidth = width / colors.length;
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i * barWidth, 0, barWidth, height * 0.67);
  });

  // 底部的蓝色背景条
  ctx.fillStyle = '#0000c0';
  ctx.fillRect(0, height * 0.67, width, height * 0.075);

  // 底部的黑色、白色、黑色条
  const bottomHeight = height * 0.255;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, height * 0.745, width * 0.67, bottomHeight);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(width * 0.67, height * 0.745, width * 0.08, bottomHeight);

  ctx.fillStyle = '#000000';
  ctx.fillRect(width * 0.75, height * 0.745, width * 0.25, bottomHeight);

  // 彩色方块
  const blockWidth = barWidth * 0.14;
  const blockHeight = bottomHeight * 0.8;
  const blockY = height * 0.745 + (bottomHeight - blockHeight) / 2;

  ctx.fillStyle = '#2000cc'; // I
  ctx.fillRect(barWidth * 1, blockY, blockWidth, blockHeight);

  ctx.fillStyle = '#ffffff'; // 白
  ctx.fillRect(barWidth * 2.5, blockY, blockWidth, blockHeight);

  ctx.fillStyle = '#44cc00'; // Q
  ctx.fillRect(barWidth * 4, blockY, blockWidth, blockHeight);

  ctx.fillStyle = '#131313'; // 黑色-3.5
  ctx.fillRect(barWidth * 5.5, blockY, blockWidth, blockHeight);

  ctx.fillStyle = '#1d1d1d'; // 黑色+7.5
  ctx.fillRect(barWidth * 6.5, blockY, blockWidth, blockHeight);
}

// 绘制彩色块
export function drawColorBlocks(ctx, width, height, time) {
  const blockSize = Math.min(width, height) / 4;
  const numCols = Math.ceil(width / blockSize);
  const numRows = Math.ceil(height / blockSize);

  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      const r = Math.floor(127.5 * (1 + Math.sin(x * 0.3 + time * 2)));
      const g = Math.floor(127.5 * (1 + Math.sin(y * 0.3 + time * 3)));
      const b = Math.floor(127.5 * (1 + Math.sin((x + y) * 0.3 + time * 5)));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }
}

// 绘制渐变
export function drawGradient(ctx, width, height, time) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);

  const r1 = Math.floor(127.5 * (1 + Math.sin(time * 2)));
  const g1 = Math.floor(127.5 * (1 + Math.sin(time * 3 + 2)));
  const b1 = Math.floor(127.5 * (1 + Math.sin(time * 5 + 4)));

  const r2 = Math.floor(127.5 * (1 + Math.sin(time * 3 + 1)));
  const g2 = Math.floor(127.5 * (1 + Math.sin(time * 4 + 3)));
  const b2 = Math.floor(127.5 * (1 + Math.sin(time * 2 + 5)));

  gradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
  gradient.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// 绘制时间码
export function drawTimeCode(ctx, width, height, time) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const hours = Math.floor(time / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  const frames = Math.floor((time % 1) * 30).toString().padStart(2, '0');

  const timeCode = `${hours}:${minutes}:${seconds}:${frames}`;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${height / 6}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(timeCode, width / 2, height / 2);

  const barHeight = height / 20;
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, height - barHeight, width, barHeight);

  ctx.fillStyle = '#00FF00';
  ctx.fillRect(0, height - barHeight, width * (time % 60) / 60, barHeight);
}

// 绘制倒计时
export function drawCountdown(ctx, width, height, time, duration) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const remaining = Math.max(0, duration - time);
  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = Math.floor(remaining % 60).toString().padStart(2, '0');
  const milliseconds = Math.floor((remaining % 1) * 100).toString().padStart(2, '0');

  const timeText = `${minutes}:${seconds}.${milliseconds}`;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${height / 4}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(timeText, width / 2, height / 2);

  // 进度条
  const barHeight = height / 10;
  const progress = 1 - (remaining / duration);

  ctx.fillStyle = '#333333';
  ctx.fillRect(0, height - barHeight, width, barHeight);

  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, height - barHeight, width * progress, barHeight);
}

// 绘制棋盘格
export function drawCheckerboard(ctx, width, height, time) {
  const size = Math.min(width, height) / 16;
  const numCols = Math.ceil(width / size);
  const numRows = Math.ceil(height / size);
  const offset = Math.floor(time * 2) % 2;

  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      ctx.fillStyle = ((x + y + offset) % 2 === 0) ? '#FFFFFF' : '#000000';
      ctx.fillRect(x * size, y * size, size, size);
    }
  }
}

// 绘制噪点
export function drawNoise(ctx, width, height, time) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.floor(Math.random() * 256);
    data[i] = value;     // R
    data[i + 1] = value; // G
    data[i + 2] = value; // B
    data[i + 3] = 255;   // A
  }

  ctx.putImageData(imageData, 0, 0);
}
// 绘制上传的图片并应用运动效果
export function drawImagePattern(ctx, width, height, time, image, motionType) {
  if (!image) return;

  ctx.fillStyle = '#000000'; // Background color if image doesn't cover canvas
  ctx.fillRect(0, 0, width, height);

  const imgWidth = image.naturalWidth;
  const imgHeight = image.naturalHeight;
  const aspectRatio = imgWidth / imgHeight;

  // Calculate dimensions to fit the image within the canvas while maintaining aspect ratio
  let drawWidth, drawHeight, offsetX, offsetY;
  if (width / height > aspectRatio) {
    // Canvas is wider than image
    drawHeight = height;
    drawWidth = height * aspectRatio;
    offsetX = (width - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Canvas is taller than image or same aspect ratio
    drawWidth = width;
    drawHeight = width / aspectRatio;
    offsetX = 0;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.save(); // Save context state before transformations

  // Center the drawing operations relative to the scaled image position
  ctx.translate(offsetX + drawWidth / 2, offsetY + drawHeight / 2);

  switch (motionType) {
    case 'scroll':
      // Simple horizontal scroll
      const scrollSpeed = drawWidth * 0.2; // Adjust speed as needed
      const scrollOffset = (time * scrollSpeed) % (drawWidth * 2) - drawWidth;
      ctx.drawImage(image, -drawWidth / 2 + scrollOffset, -drawHeight / 2, drawWidth, drawHeight);
      // Draw a second image for seamless looping if needed
      if (scrollOffset > 0) {
        ctx.drawImage(image, -drawWidth / 2 + scrollOffset - drawWidth, -drawHeight / 2, drawWidth, drawHeight);
      } else {
         ctx.drawImage(image, -drawWidth / 2 + scrollOffset + drawWidth, -drawHeight / 2, drawWidth, drawHeight);
      }
      break;

    case 'flip':
      // Flip horizontally back and forth
      const flipSpeed = 2; // Flips per second
      const scaleX = Math.cos(time * Math.PI * flipSpeed);
      ctx.scale(scaleX, 1);
      ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      break;

    case 'random':
      // Random position jitter
      const maxJitter = Math.min(drawWidth, drawHeight) * 0.05;
      const randomX = (Math.random() - 0.5) * maxJitter;
      const randomY = (Math.random() - 0.5) * maxJitter;
      ctx.drawImage(image, -drawWidth / 2 + randomX, -drawHeight / 2 + randomY, drawWidth, drawHeight);
      break;

    default: // Static image if motion type is unknown
       ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      break;
  }

  ctx.restore(); // Restore context state
}