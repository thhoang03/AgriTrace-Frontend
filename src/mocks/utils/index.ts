export const MOCK_DELAY_MS = 300;

export function mockDelay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MockResponse<T> {
  data: T;
  message: string;
  status: number;
}

export function ok<T>(data: T, message = "OK"): MockResponse<T> {
  return { data, message, status: 200 };
}

export function notFound(message = "Not found"): MockResponse<null> {
  return { data: null, message, status: 404 };
}

export function conflict(message = "Conflict"): MockResponse<null> {
  return { data: null, message, status: 409 };
}
