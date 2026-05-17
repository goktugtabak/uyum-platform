const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/gu;

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Gradients -> Solid Colors
  content = content.replace(/bg-gradient-brand/g, 'bg-primary');
  content = content.replace(/bg-gradient-deep/g, 'bg-primary-deep');
  
  // Replace arbitrary tailwind gradient classes just in case
  content = content.replace(/bg-gradient-to-[a-z]+\s+/g, '');
  content = content.replace(/from-[a-z0-9\-\/]+\s+/g, '');
  content = content.replace(/via-[a-z0-9\-\/]+\s+/g, '');
  content = content.replace(/to-[a-z0-9\-\/]+/g, '');

  // 2. Remove Emojis
  content = content.replace(EMOJI_REGEX, '');

  // 3. Remove "Kendi etkinliğini oluştur" card from EventList.tsx
  if (filePath.includes('EventList.tsx')) {
    content = content.replace(/<CreateEventBlock\s*\/>/g, '');
  }

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log('Cleaned', filePath);
  }
}

walkDir('src', processFile);
console.log('Done cleaning gradients and emojis.');
