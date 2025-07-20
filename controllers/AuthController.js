import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class AuthController {
  static async getConnect(req, res) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode Base64 credentials
    const base64Credentials = auth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!dbClient.isAlive()) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    try {
      // Find user by email
      const user = await dbClient.db.collection('users').findOne({ email });
      if (!user || user.password !== sha1(password)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate token and save in Redis
      const token = uuidv4();
      const redisKey = `auth_${token}`;
      await redisClient.set(redisKey, user._id.toString(), 24 * 3600); // expires in 24h

      return res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await redisClient.del(redisKey);
    return res.status(204).send();
  }
}

export default AuthController;
