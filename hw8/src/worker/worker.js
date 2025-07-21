const path = require("node:path");
const { writeFile } = require("node:fs/promises");
const { join } = path;
const { parentPort, workerData, threadId } = require("node:worker_threads");
const { access, mkdir, readFile } = require("node:fs/promises");
const { SharedMutex } = require("./mutex");
const sharp = require("sharp");

sharp.cache(false);
sharp.concurrency(1);

async function processImage() {
  const { imagePath, options, workerId, requestId, mutexBuffer } = workerData;
  const mutex = new SharedMutex(mutexBuffer);
  let sharpInstance = null;
  let processedBuffer = null;

  try {
    /**
     * Check if input file exists
     * */
    await access(imagePath);

    /**
     * Create output directory if it doesn't exist
     * */
    const outputDir = join(process.cwd(), "public", requestId);
    await mkdir(outputDir, { recursive: true });

    /**
     *  Generate output filename
     * */
    const ext = options.format;
    const fileName = `${path.basename(imagePath, path.extname(imagePath))}.${ext}`;
    const outputPath = join(outputDir, fileName);

    /**
     * Read file as buffer that sharp wouldn't keep it opened
     * */
    const imageBuffer = await readFile(imagePath);

    /**
     *  Process image with Sharp using buffer instead of file path
     *  ### Restrict control and size memory
     * */
    sharpInstance = sharp(imageBuffer, {
      sequentialRead: false,
      limitInputPixels: 268402689,
      pages: 1
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
          mozjpeg: false,
          optimiseScans: false
        });
        break;
      case "png":
        sharpInstance = sharpInstance.png({
          quality: options.quality,
          progressive: false,
          compressionLevel: 6,
          palette: true
        });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({
          quality: options.quality,
          effort: 4,
          nearLossless: false
        });
        break;
    }

    /**
     * attempt to use toBuffer() instead of toFile()
     * */
    processedBuffer = await sharpInstance.toBuffer();

    /**
     * Read buffer Result manually
     * */
    await writeFile(outputPath, processedBuffer);

    /**
     * clean buffers
     * */
    imageBuffer.fill(0);
    processedBuffer.fill(0);

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
    processedBuffer = null;

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
async function gracefulShutdown() {
  try {
    sharp.cache({ items: 0, files: 0, memory: 0 });
    if (global.gc) {
      for (let i = 0; i < 3; i++) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  } catch (error) {
    console.error(`Worker ${workerData?.workerId}: Shutdown error:`, error);
  }
}

process.on("SIGTERM", async () => {
  await gracefulShutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await gracefulShutdown();
  process.exit(0);
});


process.on("uncaughtException", (error) => {
  parentPort?.postMessage({
    type: "error",
    workerId: workerData?.workerId,
    error: error.message
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  parentPort?.postMessage({
    type: "error",
    workerId: workerData?.workerId,
    error: reason instanceof Error ? reason.message : String(reason)
  });
  process.exit(1);
});

processImage()
  .then()
  .catch(error => {
    parentPort?.postMessage({
      type: "error",
      workerId: workerData?.workerId,
      error: error instanceof Error ? error.message : String(error)
    });
  })
  .finally(async () => {
    await gracefulShutdown();

    const exitTimer = setTimeout(() => {
      process.exit(0);
    }, 1000);

    exitTimer.unref();
  });
