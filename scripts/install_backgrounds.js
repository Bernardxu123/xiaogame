import fs from 'fs';
import path from 'path';

const SRC_DIR = 'D:\\AI\\AIii\\照顾兔兔\\new\\场景背景';
const DEST_DIR = 'D:\\AI\\AIii\\照顾兔兔\\src\\assets\\pixel';

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

const MAPPING = {
    '温馨小屋.jpg': 'bg_room.jpg',
    '阳光花园.png': 'bg_garden.png',
    '夏日海滩.png': 'bg_beach.png',
    '梦幻星空.png': 'bg_night.png',
    '糖果乐园.png': 'bg_candy.png'
};

console.log('🖼️  Installing new backgrounds...');

for (const [srcName, destName] of Object.entries(MAPPING)) {
    const srcPath = path.join(SRC_DIR, srcName);
    const destPath = path.join(DEST_DIR, destName);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ ${srcName} -> ${destName}`);
    } else {
        console.warn(`⚠️  Missing: ${srcName}`);
    }
}
