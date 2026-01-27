# PWA 设置说明

## ✅ 已完成的设置

1. ✅ 创建了 `manifest.json` 文件
2. ✅ 创建了 `AddToHomeScreen` 组件
3. ✅ 更新了 `layout.tsx` 添加 PWA meta 标签
4. ✅ 更新了 `page.tsx` 集成添加主屏幕功能

## 📱 需要完成的步骤

### 生成图标文件

PWA 需要以下图标文件（放在 `public` 目录）：

- `icon-192.png` (192x192 像素)
- `icon-512.png` (512x512 像素)

### 生成图标的方法

#### 方法 1: 使用在线工具（推荐）

1. 访问 https://realfavicongenerator.net/
2. 上传你的图标设计（可以使用 `/public/icon.svg` 或 `/public/images/logo.svg`）
3. 下载生成的图标文件
4. 将 `icon-192.png` 和 `icon-512.png` 放到 `public` 目录

#### 方法 2: 使用 ImageMagick

```bash
# 如果已安装 ImageMagick
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

#### 方法 3: 使用设计工具

使用 Figma、Sketch 或其他设计工具：
1. 创建 192x192 和 512x512 的画布
2. 使用橙色背景 (#ff6b35) 和火焰图标
3. 导出为 PNG 格式
4. 保存到 `public` 目录

### 图标设计建议

- **背景色**: 使用品牌橙色 `#ff6b35`
- **图标**: 使用火焰图标（与 favicon 一致）
- **圆角**: 建议使用圆角设计（iOS 会自动添加圆角）
- **对比度**: 确保图标在深色和浅色背景下都清晰可见

## 🧪 测试

### Desktop (Chrome/Edge)

1. 在桌面浏览器打开网站
2. 如果满足安装条件，地址栏右侧会出现安装图标，或者页面下方会出现"添加到主屏幕"提示
3. 点击"立即添加"即可安装为桌面应用

### Android (Chrome)

1. 在 Android 设备上打开网站
2. 应该会看到"添加到主屏幕"的提示横幅
3. 点击"立即添加"按钮
4. 确认后，应用图标会出现在主屏幕上

### iOS (Safari)

1. 在 iOS 设备上打开网站
2. 点击"显示步骤"按钮
3. 按照提示操作：
   - 点击分享按钮
   - 选择"添加到主屏幕"
   - 确认添加

## 📝 注意事项

1. **HTTPS 要求**: PWA 功能需要 HTTPS（生产环境）。本地开发环境建议使用 `localhost` 或配置 HTTPS
2. **Service Worker**: 已添加 `public/sw.js`，这是实现桌面和 Android 安装提示的关键
3. **图标格式**: 必须使用 PNG 格式，不支持 SVG
4. **清理缓存**: 如果修改了 `manifest.json` 或 `sw.js`，建议在浏览器开发者工具的 "Application" 面板中执行 "Clear storage" 或手动 "Unregister" Service Worker 以确保更改生效

## 🚀 部署

部署到 Vercel 后，PWA 功能会自动启用（因为 Vercel 默认使用 HTTPS）。

确保在部署前：
1. ✅ 图标文件已创建并放在 `public` 目录
2. ✅ `manifest.json` 配置正确
3. ✅ 所有 meta 标签已添加
