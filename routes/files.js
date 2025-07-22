import express from 'express';
import FilesController from '../controllers/FilesController.js';

const router = express.Router();

// POST /files (upload)
router.post('/', FilesController.postUpload);

// GET /files/:id (show metadata)
router.get('/:id', FilesController.getShow);

export default router;
