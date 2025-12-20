import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Configuration
const SOURCE_DIR = 'D:\\AI\\AIii\\照顾兔兔\\new\\素材';
const OUTPUT_DIR = 'D:\\AI\\AIii\\照顾兔兔\\src\\assets\\pixel\\sliced';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processImage(filename) {
    const filepath = path.join(SOURCE_DIR, filename);
    console.log(`Processing: ${filename}`);

    const { data, info } = await sharp(filepath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const width = info.width;
    const height = info.height;
    const visited = new Uint8Array(width * height);

    const islands = []; // { minX, minY, maxX, maxY }

    const isOpaque = (x, y) => {
        const idx = (y * width + x) * 4;
        return data[idx + 3] > 10;
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!visited[y * width + x] && isOpaque(x, y)) {
                const island = { minX: x, minY: y, maxX: x, maxY: y, count: 0 };
                const queue = [{ x, y }];
                visited[y * width + x] = 1;

                while (queue.length > 0) {
                    const p = queue.pop();
                    island.count++;
                    island.minX = Math.min(island.minX, p.x);
                    island.minY = Math.min(island.minY, p.y);
                    island.maxX = Math.max(island.maxX, p.x);
                    island.maxY = Math.max(island.maxY, p.y);

                    const neighbors = [
                        { x: p.x + 1, y: p.y }, { x: p.x - 1, y: p.y },
                        { x: p.x, y: p.y + 1 }, { x: p.x, y: p.y - 1 }
                    ];

                    for (const n of neighbors) {
                        if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                            const nIdx = n.y * width + n.x;
                            if (!visited[nIdx] && isOpaque(n.x, n.y)) {
                                visited[nIdx] = 1;
                                queue.push(n);
                            }
                        }
                    }
                }

                // Filter: > 400 pixels (roughly 20x20) to ignore noise, but small enough for items
                if (island.count > 400) {
                    island.minX = Math.max(0, island.minX - 1);
                    island.minY = Math.max(0, island.minY - 1);
                    island.maxX = Math.min(width, island.maxX + 2);
                    island.maxY = Math.min(height, island.maxY + 2);
                    islands.push(island);
                }
            }
        }
    }

    console.log(`Found ${islands.length} objects.`);

    const originalName = path.parse(filename).name;
    for (let i = 0; i < islands.length; i++) {
        const isl = islands[i];
        const w = isl.maxX - isl.minX;
        const h = isl.maxY - isl.minY;

        if (w <= 0 || h <= 0) continue;

        const outName = `${originalName}_${String(i).padStart(2, '0')}.png`;
        const outPath = path.join(OUTPUT_DIR, outName);

        await sharp(filepath)
            .extract({ left: isl.minX, top: isl.minY, width: w, height: h })
            .toFile(outPath);

        console.log(`  Saved: ${outName}`);
    }
}

async function main() {
    try {
        const files = fs.readdirSync(SOURCE_DIR);
        for (const file of files) {
            if (file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
                await processImage(file);
            }
        }
        console.log('Done!');
    } catch (e) {
        console.error(e);
    }
}

main();
