type QueuedRequest<T> = () => Promise<T>;

export class APIRateLimiter {
  private queue: Array<QueuedRequest<any>> = [];
  private processing = false;
  private lastCallTime = 0;
  private readonly minInterval: number;

  constructor(minInterval: number = 1000) {
    this.minInterval = minInterval;
  }

  async enqueue<T>(apiCall: QueuedRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;

      if (timeSinceLastCall < this.minInterval) {
        await this.delay(this.minInterval - timeSinceLastCall);
      }

      const apiCall = this.queue.shift();
      if (apiCall) {
        this.lastCallTime = Date.now();
        await apiCall();
      }
    }

    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
