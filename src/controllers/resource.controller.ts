import { Request, Response } from 'express';
import { ResourceService } from '../services/resource.service';

export class ResourceController {
  private resourceService: ResourceService;

  constructor() {
    this.resourceService = new ResourceService();
  }

  getAllResources = async (req: Request, res: Response) => {
    try {
      const resources = await this.resourceService.getAllResources();
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  };

  getResourceById = async (req: Request, res: Response) => {
    try {
      const resource = await this.resourceService.getResourceById(req.params.id);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ error: 'Failed to fetch resource' });
    }
  };

  getResourcesByTopicId = async (req: Request, res: Response) => {
    try {
      const resources = await this.resourceService.getResourcesByTopicId(req.params.topicId);
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  };

  createResource = async (req: Request, res: Response) => {
    try {
      const resource = await this.resourceService.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      console.error('Error creating resource:', error);
      if (error instanceof Error) {
        if (error.message === 'Topic not found') {
          return res.status(404).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Failed to create resource' });
    }
  };

  updateResource = async (req: Request, res: Response) => {
    try {
      const resource = await this.resourceService.updateResource(req.params.id, req.body);
      res.json(resource);
    } catch (error) {
      console.error('Error updating resource:', error);
      if (error instanceof Error) {
        if (error.message === 'Resource not found') {
          return res.status(404).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Failed to update resource' });
    }
  };

  deleteResource = async (req: Request, res: Response) => {
    try {
      const resource = await this.resourceService.deleteResource(req.params.id);
      res.json(resource);
    } catch (error) {
      console.error('Error deleting resource:', error);
      if (error instanceof Error) {
        if (error.message === 'Resource not found') {
          return res.status(404).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Failed to delete resource' });
    }
  };
}
