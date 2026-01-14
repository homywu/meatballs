const fs = require('fs');
const path = require('path');

// 创建一个简单的 SVG 图标（基于 flame icon 设计）
const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#ff6b35" rx="100"/>
  <g transform="translate(256, 256)">
    <path 
      d="M-80 -20 C-70 -60, -40 -90, 0 -95 C 40 -90, 70 -60, 80 -20 C 70 20, 40 50, 0 55 C -40 50, -70 20, -80 -20 Z" 
      fill="#ffffff" 
      opacity="0.9"
    />
    <circle cx="0" cy="0" r="60" fill="#ffffff" opacity="0.95"/>
    <circle cx="-20" cy="-20" r="15" fill="#ff6b35" opacity="0.8"/>
  </g>
</svg>
`.trim();

// 创建 public 目录（如果不存在）
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 保存 SVG 文件
const svgPath = path.join(publicDir, 'icon.svg');
fs.writeFileSync(svgPath, iconSVG);

console.log('✅ 已创建 icon.svg');
console.log('');
console.log('⚠️  注意：PWA 需要 PNG 格式的图标文件。');
console.log('请使用以下工具之一将 SVG 转换为 PNG：');
console.log('');
console.log('1. 在线工具：https://convertio.co/svg-png/');
console.log('2. ImageMagick: convert icon.svg -resize 192x192 icon-192.png');
console.log('3. 或使用设计工具（Figma, Sketch 等）导出 PNG');
console.log('');
console.log('需要创建以下文件：');
console.log('  - /public/icon-192.png (192x192 像素)');
console.log('  - /public/icon-512.png (512x512 像素)');
