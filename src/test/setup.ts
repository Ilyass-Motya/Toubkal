/**
 * Test Environment Setup
 * 
 * Provides mocks and polyfills for browser APIs and Node.js globals
 * that are not available in the test environment.
 */

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: vi.fn((callback: FrameRequestCallback) => {
    return setTimeout(callback, 16);
  }),
  writable: true
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: vi.fn((id: number) => {
    clearTimeout(id);
  }),
  writable: true
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    getEntriesByType: vi.fn(() => []),
    getEntries: vi.fn(() => []),
    mark: vi.fn(),
    measure: vi.fn(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    }
  },
  writable: true
});

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => [])
})) as any;

// Add supportedEntryTypes to PerformanceObserver
(global.PerformanceObserver as any).supportedEntryTypes = ['navigation', 'resource', 'measure', 'mark'];

// Mock NodeJS types
declare global {
  namespace NodeJS {
    interface Timeout {
      _idleTimeout: number;
      _idlePrev: Timeout | null;
      _idleNext: Timeout | null;
      _idleStart: number;
      _onTimeout: (...args: any[]) => void;
      _repeat: (() => void) | null;
    }
  }
}

// Export the module to make it a proper module
export {};

// Mock URL constructor
global.URL = class URL {
  protocol: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
  href: string;

  constructor(url: string, base?: string) {
    const parsed = new URL(url, base);
    this.protocol = parsed.protocol;
    this.hostname = parsed.hostname;
    this.pathname = parsed.pathname;
    this.search = parsed.search;
    this.hash = parsed.hash;
    this.href = parsed.href;
  }

  static canParse(url: string, base?: string): boolean {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  }

  static createObjectURL(obj: Blob | MediaSource): string {
    return `blob:${Math.random().toString(36).substring(2)}`;
  }

  static parse(url: string, base?: string): URL | null {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  }

  static revokeObjectURL(url: string): void {
    // Mock implementation
  }
} as any;

// Mock btoa/atob
global.btoa = vi.fn((str: string) => Buffer.from(str, 'binary').toString('base64'));
global.atob = vi.fn((str: string) => Buffer.from(str, 'base64').toString('binary'));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    protocol: 'http:',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  writable: true
});

// Mock console methods to prevent test output
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};