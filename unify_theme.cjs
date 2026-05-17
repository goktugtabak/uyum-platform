const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Exact Hex replacements
  content = content.replace(/(bg|text|border|ring)-\[\#320E3B\]/g, '$1-primary-deep');
  content = content.replace(/(bg|text|border|ring)-\[\#4C2A85\]/g, '$1-primary');
  content = content.replace(/(bg|text|border|ring)-\[\#6B7FD7\]/g, '$1-accent');
  content = content.replace(/(bg|text|border|ring)-\[\#DDFBD2\]/g, '$1-mint');
  content = content.replace(/(bg|text|border|ring)-\[\#BCEDF6\]/g, '$1-sky');
  content = content.replace(/(bg|text|border|ring)-\[\#f8f7f7\]/g, '$1-muted');
  content = content.replace(/(bg|text|border|ring)-\[\#f5f3f7\]/g, '$1-secondary');
  content = content.replace(/(bg|text|border|ring)-\[\#1a0828\]/g, '$1-primary-deep'); // Footer
  content = content.replace(/(bg|text|border|ring)-\[\#E0F7FA\]/g, '$1-sky/30'); // Sidebar/Landing
  content = content.replace(/(bg|text|border|ring)-\[\#00BCD4\]/g, '$1-sky-foreground');

  // Hardcoded OKLCH styles (Warning / Peachy / Purple ones from previous devs)
  // Let's replace the common OKLCH patterns found in the project with primary/accent variants.
  content = content.replace(/bg-\[oklch\(0\.92_0\.07_60\)\]/g, 'bg-accent/15');
  content = content.replace(/text-\[oklch\(0\.55_0\.16_50\)\]/g, 'text-accent');
  content = content.replace(/text-\[oklch\(0\.55_0\.16_60\)\]/g, 'text-accent');
  
  content = content.replace(/bg-\[oklch\(0\.62_0\.18_55\)\]/g, 'bg-primary');
  content = content.replace(/text-\[oklch\(0\.62_0\.18_55\)\]/g, 'text-primary');

  content = content.replace(/bg-\[oklch\(0\.95_0\.06_30\)\]/g, 'bg-primary/10');
  content = content.replace(/text-\[oklch\(0\.55_0\.18_30\)\]/g, 'text-primary');
  
  content = content.replace(/text-\[oklch\(0\.55_0\.18_50\)\]/g, 'text-accent');

  // Remove `font-display` and `font-sans` classes so global CSS `h1-h6` handles the font family
  content = content.replace(/\bfont-display\b/g, '');
  content = content.replace(/\bfont-sans\b/g, '');

  // Cleanup multiple spaces only in class names if needed (but avoid line breaks)
  content = content.replace(/className="[ \t]+/g, 'className="');

  // Specific landing page manual color fixes
  if (filePath.includes('Landing.tsx')) {
    content = content.replace(/iconColor: '#00BCD4', bgColor: '#E0F7FA'/g, "iconColor: 'var(--color-sky-foreground)', bgColor: 'var(--color-sky)'");
    content = content.replace(/iconColor: '#43A047', bgColor: '#E8F5E9'/g, "iconColor: 'var(--color-mint-foreground)', bgColor: 'var(--color-mint)'");
    content = content.replace(/iconColor: '#7B2FBE', bgColor: '#F3E5F5'/g, "iconColor: 'var(--color-primary)', bgColor: 'var(--color-secondary)'");
    content = content.replace(/iconColor: '#FF6B35', bgColor: '#FFF3E0'/g, "iconColor: 'var(--color-accent)', bgColor: 'rgba(107, 127, 215, 0.15)'");
    content = content.replace(/iconColor: '#00897B', bgColor: '#E0F2F1'/g, "iconColor: 'var(--color-sky-foreground)', bgColor: 'var(--color-sky)'");
    
    // Also the style object ones
    content = content.replace(/backgroundColor: '#4C2A85'/g, "backgroundColor: 'var(--color-primary)'");
  }

  // Specific Onboarding.tsx gradient hex fixes
  if (filePath.includes('Onboarding.tsx')) {
    content = content.replace(/#f8f7f7/g, 'var(--color-muted)');
  }

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
}

walkDir('src', processFile);
console.log('Color/Font Unification Complete');
