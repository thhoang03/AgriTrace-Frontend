import { describe, it, expect } from 'vitest';
import { router } from '../app/router';

describe('Ứng dụng Agri Trace', () => {
  it('kiểm tra phép tính cơ bản', () => {
    expect(1 + 1).toBe(2);
  });

  it('registers a fallback route for unknown URLs', () => {
    expect(router.routes.some((route) => route.path === '*')).toBe(true);
  });
});