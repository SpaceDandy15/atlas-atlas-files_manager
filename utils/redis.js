import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    // Handle errors
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    // Connect to Redis
    this.client.connect()
      .then(() => {
        console.log('Redis client connected');
      })
      .catch((err) => {
        console.error('Redis connection failed:', err);
      });
  }

  // Check if Redis is alive
  isAlive() {
    return this.client.isOpen;
  }

  // Get a value by key
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error(`Redis GET error for key "${key}":`, err);
      return null;
    }
  }

  // Set a value with expiration in seconds
  async set(key, value, duration) {
    try {
      await this.client.setEx(key, duration, value.toString());
    } catch (err) {
      console.error(`Redis SET error for key "${key}":`, err);
    }
  }

  // Delete a key
  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`Redis DEL error for key "${key}":`, err);
    }
  }
}

// Export a single instance
const redisClient = new RedisClient();
export default redisClient;
