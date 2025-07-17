import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.connected = false;

    // Connection events
    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.client.on('ready', () => {
      this.connected = true;
    });

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
      this.connected = false;
    });

    this.client.on('end', () => {
      console.log('Redis connection closed');
      this.connected = false;
    });

    // Promisify Redis methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (err) {
      console.error(`Redis GET error for key "${key}":`, err);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
    } catch (err) {
      console.error(`Redis SET error for key "${key}":`, err);
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
    } catch (err) {
      console.error(`Redis DEL error for key "${key}":`, err);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
