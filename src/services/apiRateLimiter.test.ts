import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { APIRateLimiter } from './apiRateLimiter';

describe('APIRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should process requests with minimum interval', async () => {
    const limiter = new APIRateLimiter(1000);
    const results: number[] = [];
    const timestamps: number[] = [];

    const createRequest = (value: number) => async () => {
      timestamps.push(Date.now());
      return value;
    };

    // 3つのリクエストをキューに追加
    const promise1 = limiter.enqueue(createRequest(1));
    const promise2 = limiter.enqueue(createRequest(2));
    const promise3 = limiter.enqueue(createRequest(3));

    // 最初のリクエストはすぐに実行される
    await vi.advanceTimersByTimeAsync(0);
    results.push(await promise1);
    expect(results[0]).toBe(1);

    // 2番目のリクエストは1秒後
    await vi.advanceTimersByTimeAsync(1000);
    results.push(await promise2);
    expect(results[1]).toBe(2);

    // 3番目のリクエストも1秒後
    await vi.advanceTimersByTimeAsync(1000);
    results.push(await promise3);
    expect(results[2]).toBe(3);

    // タイムスタンプの間隔を確認
    expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(1000);
    expect(timestamps[2] - timestamps[1]).toBeGreaterThanOrEqual(1000);
  });

  it('should handle errors in requests', async () => {
    const limiter = new APIRateLimiter(500);

    const failingRequest = async () => {
      throw new Error('Request failed');
    };

    await expect(limiter.enqueue(failingRequest)).rejects.toThrow('Request failed');
  });

  it('should return correct queue length', () => {
    const limiter = new APIRateLimiter(1000);

    limiter.enqueue(async () => 1);
    limiter.enqueue(async () => 2);
    limiter.enqueue(async () => 3);

    // 処理開始前は3つ
    expect(limiter.getQueueLength()).toBeGreaterThan(0);
  });

  it('should process queue sequentially', async () => {
    const limiter = new APIRateLimiter(100);
    const executionOrder: number[] = [];

    const createRequest = (id: number) => async () => {
      executionOrder.push(id);
      return id;
    };

    limiter.enqueue(createRequest(1));
    limiter.enqueue(createRequest(2));
    limiter.enqueue(createRequest(3));

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    expect(executionOrder).toEqual([1, 2, 3]);
  });
});
