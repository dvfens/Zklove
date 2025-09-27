#!/usr/bin/env node

/**
 * zkLove Production Deployment Script
 * Builds and prepares the app for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 zkLove Production Deployment Script');
console.log('=====================================\n');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ Production build not found. Please run the build first.');
  console.log('Run: npx expo export --platform web --output-dir dist');
  process.exit(1);
}

// Get build stats
const getDirectorySize = (dirPath) => {
  let totalSize = 0;
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(itemPath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
};

const buildSize = getDirectorySize(distPath);
const buildSizeMB = (buildSize / (1024 * 1024)).toFixed(2);

console.log('✅ Production Build Summary');
console.log('==========================');
console.log(`📦 Build Size: ${buildSizeMB} MB`);
console.log(`📁 Output Directory: ${distPath}`);
console.log(`🌐 Ready for web deployment\n`);

// List key files
console.log('📋 Key Production Files:');
console.log('========================');

const keyFiles = [
  'index.html',
  'modal.html',
  '_sitemap.html',
  '+not-found.html',
  'favicon.ico'
];

keyFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`  ✓ ${file} (${sizeKB} KB)`);
  }
});

console.log('\n🔧 JavaScript Bundle:');
const jsDir = path.join(distPath, '_expo', 'static', 'js', 'web');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir);
  jsFiles.forEach(file => {
    const filePath = path.join(jsDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  ✓ ${file} (${sizeMB} MB)`);
  });
}

console.log('\n🎨 CSS Bundle:');
const cssDir = path.join(distPath, '_expo', 'static', 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir);
  cssFiles.forEach(file => {
    const filePath = path.join(cssDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`  ✓ ${file} (${sizeKB} KB)`);
  });
}

console.log('\n🚀 Deployment Options:');
console.log('======================');
console.log('1. 🌐 Static Web Hosting:');
console.log('   - Upload the entire "dist" folder to your web server');
console.log('   - Configure your server to serve index.html for all routes');
console.log('   - Ensure HTTPS is enabled for camera/NFC features');
console.log('');
console.log('2. ☁️ Cloud Deployment:');
console.log('   - Vercel: vercel --prod dist/');
console.log('   - Netlify: netlify deploy --prod --dir dist/');
console.log('   - AWS S3: aws s3 sync dist/ s3://your-bucket-name/');
console.log('   - GitHub Pages: Copy dist/ contents to gh-pages branch');
console.log('');
console.log('3. 🐳 Docker Deployment:');
console.log('   - Use nginx:alpine as base image');
console.log('   - Copy dist/ to /usr/share/nginx/html/');
console.log('   - Configure nginx for SPA routing');
console.log('');

console.log('⚠️  Production Checklist:');
console.log('=========================');
console.log('□ Update environment variables for production');
console.log('□ Configure HTTPS (required for camera/NFC)');
console.log('□ Set up proper CORS headers');
console.log('□ Configure CSP headers for security');
console.log('□ Test all verification flows in production');
console.log('□ Monitor performance and error rates');
console.log('□ Set up analytics and monitoring');
console.log('');

console.log('🔒 Security Notes:');
console.log('==================');
console.log('- All biometric processing happens client-side');
console.log('- No sensitive data is transmitted to servers');
console.log('- Zero-knowledge proofs protect user privacy');
console.log('- Camera and NFC require HTTPS in production');
console.log('');

console.log('✨ Production build ready for deployment!');
console.log('==========================================');
