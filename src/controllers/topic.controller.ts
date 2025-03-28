import { Request, Response } from 'express';
import { TopicService } from '../services/topic.service';
import { TopicPathFinderService } from '../services/topic-path-finder.service';
import { TopicComponent } from '../composite/topic-component.abstract';

export class TopicController {
  private topicService: TopicService;
  private topicPathFinderService: TopicPathFinderService;

  constructor() {
    this.topicService = new TopicService();
    this.topicPathFinderService = new TopicPathFinderService();
  }

  async getTopics(req: Request, res: Response) {
    try {
      const topics = await this.topicService.findAll();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  }

  async getTopic(req: Request, res: Response) {
    try {
      const topic = await this.topicService.getTopicWithChildren(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      res.json(topic);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch topic' });
    }
  }

  async getTopicPath(req: Request, res: Response) {
    try {
      const { fromId, toId } = req.params;
      console.log(`Finding path from topic ${fromId} to ${toId}`);

      const fromTopic = await this.topicService.getTopicWithChildren(fromId);
      if (!fromTopic) {
        console.log(`Source topic ${fromId} not found`);
        return res.status(404).json({ error: `Source topic ${fromId} not found` });
      }

      const toTopic = await this.topicService.getTopicWithChildren(toId);
      if (!toTopic) {
        console.log(`Target topic ${toId} not found`);
        return res.status(404).json({ error: `Target topic ${toId} not found` });
      }

      console.log('Source topic:', JSON.stringify(fromTopic, null, 2));
      console.log('Target topic:', JSON.stringify(toTopic, null, 2));

      const path = this.topicPathFinderService.findShortestPath(fromTopic, toTopic);
      
      if (!path) {
        console.log(`No path found between topics ${fromId} and ${toId}`);
        return res.status(404).json({ error: 'No path found between the topics' });
      }

      console.log('Found path:', JSON.stringify(path, null, 2));
      res.json(path);
    } catch (error) {
      console.error('Error calculating topic path:', error);
      res.status(500).json({ error: 'Failed to calculate topic path', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getTopicVersions(req: Request, res: Response) {
    try {
      const versions = await this.topicService.getTopicVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch topic versions' });
    }
  }

  async createTopic(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const topic = await this.topicService.create({ ...req.body, user: req.user });
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create topic' });
      }
    }
  }

  async updateTopic(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const topic = await this.topicService.update(req.params.id, { ...req.body, user: req.user });
      res.json(topic);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update topic' });
      }
    }
  }

  async deleteTopic(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await this.topicService.delete(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete topic' });
      }
    }
  }
}
