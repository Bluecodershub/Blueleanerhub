import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as nb from '../controllers/notebooks.controller';
import { uploadSingle } from '../middleware/upload';
import { apiLimiter, notebookAiLimiter, notebookIngestLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Notebook CRUD
router.get('/',        apiLimiter, nb.listNotebooks);
router.post('/',       apiLimiter, nb.createNotebook);
router.get('/health',  apiLimiter, nb.getNotebooksHealth);
router.get('/:id/adaptive-guidance', notebookAiLimiter, nb.getAdaptiveGuidance);
router.post('/:id/behavior-events', apiLimiter, nb.createBehaviorEvent);
router.get('/:id/annotations', apiLimiter, nb.listNotebookAnnotations);
router.get('/:id',     apiLimiter, nb.getNotebook);
router.delete('/:id',  apiLimiter, nb.deleteNotebook);

// Sources
router.post('/:id/sources',       notebookIngestLimiter, nb.addSource);
router.post('/:id/sources/pdf',   notebookIngestLimiter, uploadSingle('file'), nb.addPdfSource);
router.get('/:id/sources/:sid',   apiLimiter, nb.getSourceDetail);
router.get('/:id/sources/:sid/annotations', apiLimiter, nb.listSourceAnnotations);
router.post('/:id/sources/:sid/annotations', apiLimiter, nb.createSourceAnnotation);
router.delete('/:id/sources/:sid/annotations/:aid', apiLimiter, nb.deleteSourceAnnotation);
router.delete('/:id/sources/:sid', apiLimiter, nb.deleteSource);

// AI features
router.post('/:id/chat',     notebookAiLimiter, nb.chat);
router.delete('/:id/chat',   apiLimiter, nb.clearChat);
router.post('/:id/generate', notebookAiLimiter, nb.generate);

export default router;
