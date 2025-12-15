const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const config = {
    maxWidth: 1920,
    quality: 85,
    publicDir: path.join(__dirname, '..', 'public'),
    extensions: ['.jpg', '.jpeg', '.png', '.gif'],
    skipExtensions: ['.svg', '.webp'], // Skip these
};

// Track statistics
const stats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    totalSavedBytes: 0,
};

/**
 * Recursively find all image files in a directory
 */
function findImages(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and hidden directories
            if (!file.startsWith('.') && file !== 'node_modules') {
                findImages(filePath, fileList);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (config.extensions.includes(ext)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

/**
 * Optimize a single image
 */
async function optimizeImage(imagePath) {
    try {
        const ext = path.extname(imagePath).toLowerCase();
        const dir = path.dirname(imagePath);
        const baseName = path.basename(imagePath, ext);
        const webpPath = path.join(dir, `${baseName}.webp`);

        // Skip if WebP version already exists
        if (fs.existsSync(webpPath)) {
            console.log(`⏭️  Skipped (already exists): ${path.relative(config.publicDir, webpPath)}`);
            stats.skipped++;
            return;
        }

        // Get original file size
        const originalStats = fs.statSync(imagePath);
        const originalSize = originalStats.size;

        // Process image
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        // Resize if needed
        let pipeline = image;
        if (metadata.width > config.maxWidth) {
            pipeline = pipeline.resize(config.maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside',
            });
        }

        // Convert to WebP
        await pipeline
            .webp({ quality: config.quality })
            .toFile(webpPath);

        // Get new file size
        const newStats = fs.statSync(webpPath);
        const newSize = newStats.size;
        const savedBytes = originalSize - newSize;
        const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

        stats.totalSavedBytes += savedBytes;
        stats.processed++;

        console.log(`✅ Optimized: ${path.relative(config.publicDir, imagePath)}`);
        console.log(`   → ${path.relative(config.publicDir, webpPath)}`);
        console.log(`   💾 Saved: ${formatBytes(savedBytes)} (${savedPercent}%)\n`);

    } catch (error) {
        stats.errors++;
        console.error(`❌ Error processing ${imagePath}:`, error.message);
    }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main function
 */
async function main() {
    console.log('🖼️  Image Optimization Script\n');
    console.log(`📁 Scanning: ${config.publicDir}`);
    console.log(`📐 Max width: ${config.maxWidth}px`);
    console.log(`🎨 Quality: ${config.quality}%\n`);

    // Find all images
    const images = findImages(config.publicDir);
    console.log(`Found ${images.length} images to process\n`);

    if (images.length === 0) {
        console.log('No images found to optimize.');
        return;
    }

    // Process each image
    for (const image of images) {
        await optimizeImage(image);
    }

    // Print summary
    console.log('━'.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✅ Processed: ${stats.processed}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log(`   💾 Total saved: ${formatBytes(stats.totalSavedBytes)}`);
    console.log('━'.repeat(50));
}

// Run the script
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
