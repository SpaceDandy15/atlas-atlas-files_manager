import { ObjectId } from 'mongodb';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class FilesController {
  static async postUpload(req, res) {
    // Existing postUpload method would be here
    // This is just a placeholder for the existing functionality
    return res.status(501).json({ error: 'Not implemented yet' });
  }

  static async getShow(req, res) {
    try {
      // Get token from headers
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user ID from Redis using the token
      const redisKey = `auth_${token}`;
      const userId = await redisClient.get(redisKey);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if database is connected
      if (!dbClient.isAlive()) {
        return res.status(500).json({ error: 'Database not connected' });
      }

      // Get file ID from URL parameters
      const fileId = req.params.id;
      
      // Validate ObjectId format
      if (!ObjectId.isValid(fileId)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Find the file document
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId)
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Return the file document
      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId
      });

    } catch (error) {
      console.error('Error in getShow:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getIndex(req, res) {
    try {
      // Get token from headers
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user ID from Redis using the token
      const redisKey = `auth_${token}`;
      const userId = await redisClient.get(redisKey);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if database is connected
      if (!dbClient.isAlive()) {
        return res.status(500).json({ error: 'Database not connected' });
      }

      // Get query parameters
      const parentId = req.query.parentId || '0';
      const page = parseInt(req.query.page, 10) || 0;

      // Set up pagination
      const itemsPerPage = 20;
      const skip = page * itemsPerPage;

      // Build query filter
      const filter = {
        userId: new ObjectId(userId)
      };

      // Handle parentId
      if (parentId === '0') {
        filter.parentId = 0;
      } else if (ObjectId.isValid(parentId)) {
        filter.parentId = new ObjectId(parentId);
      } else {
        // Invalid parentId format, return empty list
        return res.status(200).json([]);
      }

      // Use aggregation for pagination
      const files = await dbClient.db.collection('files')
        .aggregate([
          { $match: filter },
          { $skip: skip },
          { $limit: itemsPerPage },
          {
            $project: {
              id: '$_id',
              userId: 1,
              name: 1,
              type: 1,
              isPublic: 1,
              parentId: 1,
              _id: 0
            }
          }
        ])
        .toArray();

      return res.status(200).json(files);

    } catch (error) {
      console.error('Error in getIndex:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FilesController;
