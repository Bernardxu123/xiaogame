import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAP_FILE = 'D:\\AI\\AIii\\照顾兔兔\\src\\assets\\asset_map.json';
const SOURCE_DIR = 'D:\\AI\\AIii\\照顾兔兔\\src\\assets\\pixel\\sliced';
const DEST_DIR = 'D:\\AI\\AIii\\照顾兔兔\\src\\assets\\pixel\\final';

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

async function run() {
    const mapData = JSON.parse(fs.readFileSync(MAP_FILE, 'utf-8'));

    let successCount = 0;
    let missingCount = 0;

    for (const item of mapData) {
        const srcPath = path.join(SOURCE_DIR, item.original);
        const destPath = path.join(DEST_DIR, item.new);

        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ Copied: ${item.original} -> ${item.new}`);
            successCount++;
        } else {
            console.warn(`⚠️ Missing Source: ${item.original} (Expected for ${item.name})`);
            missingCount++;
        }
    }

    console.log(`\nDone! Successfully processed ${successCount} assets. Missing: ${missingCount}`);

    // Also copy the map itself to the destination for reference
    fs.copyFileSync(MAP_FILE, path.join(DEST_DIR, 'asset_map.json'));
}

run();
