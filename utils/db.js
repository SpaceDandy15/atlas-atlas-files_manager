import { MongoClient } from 'mongodb';

// Setup MongoDB connection configuration
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    // Connect to MongoDB
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        this.db = false;
      });
  }

  // Check if MongoDB is connected
  isAlive() {
    return !!this.db;
  }

  // Count documents in the 'users' collection
  async nbUsers() {
    if (!this.isAlive()) return 0;
    return this.db.collection('users').countDocuments();
  }

  // Count documents in the 'files' collection
  async nbFiles() {
    if (!this.isAlive()) return 0;
    return this.db.collection('files').countDocuments();
  }
}

// Export a single shared instance
const dbClient = new DBClient();
export default dbClient;
