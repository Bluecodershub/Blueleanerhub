import { Router } from 'express';
import * as learningController from '../controllers/learning.controller';

const router = Router();

// Domain routes
router.get('/domains', learningController.getAllDomains);
router.get('/domains/:id', learningController.getDomainById);

// Specialization routes
router.get('/specializations', learningController.getAllSpecializations);
router.get('/domains/:domainId/specializations', learningController.getSpecializationsByDomain);

// Course routes
router.get('/courses', learningController.getAllCourses);
router.get('/specializations/:specId/courses', learningController.getCoursesBySpecialization);
router.get('/courses/:id', learningController.getCourseById);

// Module & Project routes
router.get('/courses/:courseId/modules', learningController.getModulesByCourse);
router.get('/modules/:moduleId/projects', learningController.getProjectsByModule);

export default router;
