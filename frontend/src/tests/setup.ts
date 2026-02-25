import '@testing-library/jest-dom';

// Mock global objects that might not be available in test environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [0];
  
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
} as unknown as typeof IntersectionObserver;

// Mock Web APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => {
    return localStorageMock.store[key] || null;
  },
  setItem: (key: string, value: string) => {
    localStorageMock.store[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete localStorageMock.store[key];
  },
  clear: () => {
    localStorageMock.store = {};
  },
  store: {} as Record<string, string>,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock crypto API
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substring(2),
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
  },
});

// Suppress console warnings in tests
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  warn: (message: string) => {
    if (!message.includes('validateDOMNesting')) {
      originalConsole.warn(message);
    }
  },
};