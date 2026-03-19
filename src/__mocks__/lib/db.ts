export const db = {
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockResolvedValue(undefined),
  }),
  query: {
    talents: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(undefined),
    },
    caseStudies: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(undefined),
    },
    brands: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    portfolioItems: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
  transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn({})),
};
