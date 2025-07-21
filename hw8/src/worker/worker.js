const path = require("node:path");
const { writeFile } = require("node:fs/promises");
const { join } = path;
const { parentPort, workerData } = require("node:worker_threads");
const { access, mkdir, readFile } = require("node:fs/promises");
const { SharedMutex } = require("./mutex");
const sharp = require("sharp");

async function processImage() {
  const { imagePath, options, workerId, mutexBuffer } = workerData;
  const mutex = new SharedMutex(mutexBuffer);
  let sharpInstance = null;

  try {
    /**
     * Check if input file exists
     * */
    await access(imagePath);

    /**
     * Create output directory if it doesn't exist
     * */
    const outputDir = join(process.cwd(), "public", "avatars");
    await mkdir(outputDir, { recursive: true });

    /**
     *  Generate output filename
     * */
    const ext = options.format;
    const fileName = `${path.basename(imagePath, path.extname(imagePath))}.${ext}`;
    const outputPath = join(outputDir, fileName);

    /**
     * #1 Read file as buffer that sharp wouldn't keep it opened
     * */
    const imageBuffer = await readFile(imagePath);

    /**
     * #2 Disable sharp cache for worker
     * */
    sharp.cache(false);

    /**
     *  Process image with Sharp using buffer instead of file path
     *  ### Restrict control and size memory
     * */
    sharpInstance = sharp(imageBuffer, {
      sequentialRead: false,
      limitInputPixels: 268402689
    })
      .resize(
        options.width,
        options.height, {
          fit: "cover",
          position: "center"
        });

    /**
     *  Apply format-specific options
     * */
    switch (options.format) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({
          quality: options.quality,
          progressive: false,
          mozjpeg: false
        });
        break;
      case "png":
        sharpInstance = sharpInstance.png({
          quality: options.quality,
          progressive: false,
          compressionLevel: 6
        });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({
          quality: options.quality,
          effort: 4
        });
        break;
    }

    /**
     * #3 attempt to use toBuffer() instead of toFile()
     * */
    const processedBuffer = await sharpInstance.toBuffer();

    /**
     * Read buffer Result manually
     * */
    await writeFile(outputPath, processedBuffer);

    /**
     * #4 clean buffers
     * */
    imageBuffer.fill(0);
    processedBuffer.fill(0);

    /**
     * #5 force clean sharp cache
     * */
    if (sharp.cache) {
      sharp.cache({ items: 0, files: 0, memory: 0 });

    }
    /**
     *  Update state under mutex
     * */
    await mutex.lock();

    try {
      parentPort?.postMessage({
        type: "success",
        workerId,
        outputPath,
        originalPath: imagePath
      });
    } finally {
      mutex.unlock();
    }

  } catch (error) {
    /**
     *  Update state under mutex
     * */
    await mutex.lock();

    try {
      parentPort?.postMessage({
        type: "error",
        workerId,
        error: error instanceof Error ? error.message : String(error),
        originalPath: imagePath
      });
    } finally {
      mutex.unlock();
    }
  } finally {
    if (sharpInstance) {
      try {
        sharpInstance.destroy();
        sharpInstance = null;
      } catch (destroyError) {
        console.error(`Worker ${workerId}: Error destroying Sharp instance:`, destroyError);
      }
    }
  }
}

/**
 *  Start processing
 * */
processImage().catch(error => {
  parentPort?.postMessage({
    type: "error",
    workerId: workerData.workerId,
    error: error instanceof Error ? error.message : String(error)
  });
});
