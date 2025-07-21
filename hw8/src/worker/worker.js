const path = require("node:path");
const { join } = path;
const sharp = require("sharp");
const { parentPort, workerData } = require("node:worker_threads");
const { access, mkdir } = require("node:fs/promises");
const { SharedMutex } = require("./mutex");

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
     *  Process image with Sharp
     * */
    sharpInstance = sharp(imagePath)
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
        sharpInstance = sharpInstance.jpeg({ quality: options.quality });
        break;
      case "png":
        sharpInstance = sharpInstance.png({ quality: options.quality });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({ quality: options.quality });
        break;
    }

    /**
     *  Save processed image
     * */
    await sharpInstance.toFile(outputPath);

    if (sharpInstance) {
      sharpInstance.destroy();
      sharpInstance = null;
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
    if (sharpInstance) {
      sharpInstance.destroy();
      sharpInstance = null;
    }

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
}).finally(() => {
  if (global.gc) {
    global.gc();
  }
});
