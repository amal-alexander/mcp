import { vi } from 'vitest';

vi.mock('re2', () => {
  return {
    default: class RE2 {
      private regex: RegExp;
      constructor(pattern: string, flags?: string) {
        this.regex = new RegExp(pattern, flags);
      }
      match(str: string) { return this.regex.exec(str); }
      test(str: string) { return this.regex.test(str); }
    }
  };
});

vi.mock('googleapis', () => {
  return {
      google: {
          auth: {
              GoogleAuth: class {},
              OAuth2: class {}
          },
          searchconsole: () => ({
              searchanalytics: {
                  query: vi.fn()
              }
          })
      },
      searchconsole_v1: {}
  };
});

export const mockSearchConsoleClient = {
  sites: {
    list: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
  sitemaps: {
    list: vi.fn(),
    submit: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
  searchanalytics: {
    query: vi.fn(),
  },
  urlInspection: {
    index: {
      inspect: vi.fn(),
    },
  },
};

vi.mock('../src/google/client', () => ({
  getSearchConsoleClient: vi.fn().mockResolvedValue(mockSearchConsoleClient),
}));
