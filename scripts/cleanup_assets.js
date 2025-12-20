import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIXEL_DIR = 'D:\\AI\\AIii\\照顾兔兔\\src\\assets\\pixel';
const FINAL_DIR = 'D:\\AI\\AIii\\照顾兔兔\\src\\assets\\pixel\\final';

// Files to keep (Eating & Poop related)
const KEEP_FILES = [
    'rabbit-eat-1.png',
    'rabbit-eat-2.png',
    'poop.png', // Assuming poop.png exists or is used
    'sliced', // Check if we want to keep raw slices
    'final'   // Source of new files
];

async function cleanup() {
    console.log('🧹 Cleaning up old assets...');

    if (fs.existsSync(PIXEL_DIR)) {
        const files = fs.readdirSync(PIXEL_DIR);
        for (const file of files) {
            if (!KEEP_FILES.includes(file) && !fs.statSync(path.join(PIXEL_DIR, file)).isDirectory()) {
                // Delete old asset
                fs.unlinkSync(path.join(PIXEL_DIR, file));
                console.log(`Deleted: ${file}`);
            }
        }
    }

    console.log('📦 Moving new assets...');
    if (fs.existsSync(FINAL_DIR)) {
        const newFiles = fs.readdirSync(FINAL_DIR);
        for (const file of newFiles) {
            const src = path.join(FINAL_DIR, file);
            const dest = path.join(PIXEL_DIR, file);

            // Move file
            if (fs.existsSync(dest)) fs.unlinkSync(dest); // Overwrite
            fs.renameSync(src, dest);
            console.log(`Moved: ${file}`);
        }
        // Remove empty final dir
        fs.rmdirSync(FINAL_DIR);
    }

    console.log('✨ Asset consolidation complete!');
}

cleanup();
