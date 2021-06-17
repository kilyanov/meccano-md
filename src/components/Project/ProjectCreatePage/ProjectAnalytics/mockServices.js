import {
    mockObjects,
    mockTones,
    mockSpeakers,
    mockQuoteLevels,
    mockQuoteTypes,
    mockCategories,
    mockAnalyticParameterTypes
} from './mockData';

export const objectService = { get: () => Promise.resolve({ data: mockObjects }) };
export const toneService = { get: () => Promise.resolve({ data: mockTones }) };
export const speakerService = { get: () => Promise.resolve({ data: mockSpeakers }) };
export const quoteLevelService = { get: () => Promise.resolve({ data: mockQuoteLevels }) };
export const quoteTypeService = { get: () => Promise.resolve({ data: mockQuoteTypes }) };
export const categoryService = { get: () => Promise.resolve({ data: mockCategories }) };
export const analyticParameterService = { get: () => Promise.resolve({ data: mockAnalyticParameterTypes }) };
