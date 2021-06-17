import {
    mockObjects,
    mockTones,
    mockSpeakers,
    mockQuoteLevels,
    mockQuoteTypes,
    mockCategories
} from './mockData';

export const objectService = { get: () => Promise.resolve({ data: mockObjects }) };
export const toneService = { get: () => Promise.resolve({ data: mockTones }) };
export const speakerService = { get: () => Promise.resolve({ data: mockSpeakers }) };
export const quoteLevelService = { get: () => Promise.resolve({ data: mockQuoteLevels }) };
export const quoteTypeService = { get: () => Promise.resolve({ data: mockQuoteTypes }) };
export const quoteCategoryService = { get: () => Promise.resolve({ data: mockCategories }) };
