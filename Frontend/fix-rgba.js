import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

function rgbaToHexAlpha(r, g, b, a) {
  const rs = parseInt(r).toString(16).padStart(2, '0');
  const gs = parseInt(g).toString(16).padStart(2, '0');
  const bs = parseInt(b).toString(16).padStart(2, '0');
  let alpha = Math.round(parseFloat(a) * 255);
  const as = alpha.toString(16).padStart(2, '0');
  return `#${rs}${gs}${bs}${as}`;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace rgba(r,g,b,a) inside any brackets [ ... rgba(...) ... ]
      // We'll replace ALL rgba(...) that appear inside arbitrary Tailwind classes.
      // Easiest is to just match `rgba(r, g, b, a)` or `rgba(r,g,b,a)` globally and convert them.
      // And we handle spaces gracefully.
      const regex = /rgba\(\s*(\d+)\s*,\s*_?(\d+)\s*,\s*_?(\d+)\s*,\s*_?([\d.]+)\s*\)/g;
      const newContent = content.replace(regex, (match, r, g, b, a) => {
        return rgbaToHexAlpha(r, g, b, a);
      });
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done!');
