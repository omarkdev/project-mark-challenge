import { randomUUID } from 'crypto';
import { TopicVersionFactory } from '../../src/factory/topic-version.factory';
import { ITopic } from '../../src/interfaces/topic.interface';

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
  randomUUID: jest.fn()
}));

describe('TopicVersionFactory', () => {
  let topicVersionFactory: TopicVersionFactory;
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockDate = new Date('2025-04-01T15:48:45-03:00');

  const mockTopic: ITopic = {
    id: '1',
    name: 'Test Topic',
    content: 'Test Content',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    versions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (randomUUID as jest.Mock).mockReturnValue(mockUUID);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    topicVersionFactory = new TopicVersionFactory();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createVersion', () => {
    it('should create a version with specified version number', () => {
      const version = 5;
      const result = topicVersionFactory.createVersion(mockTopic, version);

      expect(result).toEqual({
        id: mockUUID,
        topicId: mockTopic.id,
        name: mockTopic.name,
        content: mockTopic.content,
        version: version,
        createdAt: mockDate
      });

      expect(randomUUID).toHaveBeenCalled();
    });
  });

  describe('createInitialVersion', () => {
    it('should create version 1 of a topic', () => {
      const result = topicVersionFactory.createInitialVersion(mockTopic);

      expect(result).toEqual({
        id: mockUUID,
        topicId: mockTopic.id,
        name: mockTopic.name,
        content: mockTopic.content,
        version: 1,
        createdAt: mockDate
      });

      expect(randomUUID).toHaveBeenCalled();
    });
  });

  describe('createNextVersion', () => {
    it('should create next version based on current version', () => {
      const currentVersion = 3;
      const result = topicVersionFactory.createNextVersion(mockTopic, currentVersion);

      expect(result).toEqual({
        id: mockUUID,
        topicId: mockTopic.id,
        name: mockTopic.name,
        content: mockTopic.content,
        version: currentVersion + 1,
        createdAt: mockDate
      });

      expect(randomUUID).toHaveBeenCalled();
    });

    it('should increment version number correctly for different current versions', () => {
      const testCases = [1, 5, 10, 99];

      testCases.forEach(currentVersion => {
        const result = topicVersionFactory.createNextVersion(mockTopic, currentVersion);
        expect(result.version).toBe(currentVersion + 1);
      });
    });
  });
});
