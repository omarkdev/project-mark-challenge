// Jest setup file
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

beforeEach(() => {
  mockReset(PrismaClient);
});

// Global test timeout
jest.setTimeout(10000);

// Suppress console.error during tests
console.error = jest.fn();
