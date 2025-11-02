/**
 * Test Environment Setup
 * 
 * Provides mocks and polyfills for browser APIs and Node.js globals
 * that are not available in the test environment.
 */

// Import testing library matchers for Vitest
import '@testing-library/jest-dom'

// Mock localStorage with actual storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

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
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => [])
})) as unknown as typeof PerformanceObserver;

// Add supportedEntryTypes to PerformanceObserver
(global.PerformanceObserver as unknown as { supportedEntryTypes: string[] }).supportedEntryTypes = ['navigation', 'resource', 'measure', 'mark'] as string[];

// Mock NodeJS types

// Export the module to make it a proper module
export {};

// Mock URL constructor - use native URL constructor
// The native URL constructor should work fine in Node.js test environment

// Mock btoa/atob
global.btoa = vi.fn((str: string) => Buffer.from(str, 'binary').toString('base64'));
global.atob = vi.fn((str: string) => Buffer.from(str, 'base64').toString('binary'));

// localStorage is already mocked above

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