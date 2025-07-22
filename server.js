import express from 'express';
import routes from './routes/index.js';
import filesRoutes from './routes/files.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Load all routes
app.use('/', routes);

// Add files routes to handle /files and /files/:id etc.
app.use('/files', filesRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
