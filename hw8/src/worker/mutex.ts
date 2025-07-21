export class SharedMutex {
    private readonly buffer: SharedArrayBuffer;
    private readonly view: Int32Array;
    private static readonly UNLOCKED = 0;
    private static readonly LOCKED = 1;

    constructor(buffer?: SharedArrayBuffer) {
        if (buffer) {
            /**
             * Using existing buffer (in worker)
             * */
            this.buffer = buffer;
            this.view = new Int32Array(buffer);
        } else {
            /**
             * Creating new buffer (in main thread)
             * */
            this.buffer = new SharedArrayBuffer(4);
            this.view = new Int32Array(this.buffer);
            this.view[0] = SharedMutex.UNLOCKED;
        }
    }

    async lock(): Promise<void> {
        while (true) {
            const prevValue = Atomics.compareExchange(this.view, 0, SharedMutex.UNLOCKED, SharedMutex.LOCKED);

            if (prevValue === SharedMutex.UNLOCKED) {
                return;
            }

            await this.sleep(1);
        }
    }

    unlock(): void {
        Atomics.store(this.view, 0, SharedMutex.UNLOCKED);
        Atomics.notify(this.view, 0);
    }

    getBuffer(): SharedArrayBuffer {
        return this.buffer;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
