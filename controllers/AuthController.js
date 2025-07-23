import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import pkg from 'mongodb';
const { ObjectId } = pkg;

class AuthController {
  static async getConnect(req, res) {
    try {
      // Get Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Decode base64 credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Hash the password to compare with stored hash
      const hashedPassword = sha1(password);

      // Check if database is connected
      if (!dbClient.isAlive()) {
        return res.status(500).json({ error: 'Database not connected' });
      }

      // Find user in database
      const user = await dbClient.db.collection('users').findOne({
        email,
        password: hashedPassword
      });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate token
      const token = uuidv4();
      
      // Store token in Redis for 24 hours (86400 seconds)
      const redisKey = `auth_${token}`;
      await redisClient.setex(redisKey, 86400, user._id.toString());

      return res.status(200).json({ token });

    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      // Get token from headers
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if token exists in Redis
      const redisKey = `auth_${token}`;
      const userId = await redisClient.get(redisKey);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete token from Redis
      await redisClient.del(redisKey);

      return res.status(204).send();

    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthController;
