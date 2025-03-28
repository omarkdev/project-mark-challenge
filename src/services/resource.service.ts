import { PrismaClient, Resource, Prisma } from '@prisma/client';

export class ResourceService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllResources(): Promise<Resource[]> {
    return this.prisma.resource.findMany();
  }

  async getResourceById(id: string): Promise<Resource | null> {
    return this.prisma.resource.findUnique({
      where: { id }
    });
  }

  async getResourcesByTopicId(topicId: string): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      where: { topicId }
    });
  }

  async createResource(data: {
    topicId: string;
    url: string;
    description: string;
    type: string;
  }): Promise<Resource> {
    const { topicId, url, description, type } = data;

    // Check if topic exists
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      throw new Error('Topic not found');
    }

    return this.prisma.resource.create({
      data: {
        topicId,
        url,
        description,
        type
      }
    });
  }

  async updateResource(
    id: string,
    data: {
      url?: string;
      description?: string;
      type?: string;
    }
  ): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id }
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    return this.prisma.resource.update({
      where: { id },
      data
    });
  }

  async deleteResource(id: string): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id }
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    return this.prisma.resource.delete({
      where: { id }
    });
  }
}
