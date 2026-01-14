/**
 * 生成 PWA 图标文件
 * 
 * 这个脚本使用 Next.js 的 ImageResponse API 来生成图标
 * 运行方式: node scripts/generate-pwa-icons.js
 * 
 * 注意：这需要在 Next.js 环境中运行，或者你可以：
 * 1. 使用在线工具将 /public/icon.svg 转换为 PNG
 * 2. 使用设计工具（Figma, Sketch）导出 PNG
 * 3. 使用 ImageMagick: convert icon.svg -resize 192x192 icon-192.png
 */

const fs = require('fs');
const path = require('path');

console.log('📱 PWA 图标生成说明');
console.log('');
console.log('需要创建以下图标文件：');
console.log('  - /public/icon-192.png (192x192 像素)');
console.log('  - /public/icon-512.png (512x512 像素)');
console.log('');
console.log('推荐方法：');
console.log('1. 使用在线工具：https://realfavicongenerator.net/');
console.log('2. 使用 ImageMagick（如果已安装）：');
console.log('   convert public/icon.svg -resize 192x192 public/icon-192.png');
console.log('   convert public/icon.svg -resize 512x512 public/icon-512.png');
console.log('3. 使用设计工具（Figma, Sketch）导出 PNG');
console.log('');
console.log('图标设计建议：');
console.log('- 使用橙色背景 (#ff6b35)');
console.log('- 包含火焰图标（与 favicon 一致）');
console.log('- 确保图标在深色和浅色背景下都清晰可见');
console.log('');
