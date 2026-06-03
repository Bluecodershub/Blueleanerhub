import { Request, Response } from 'express';
import { Domain, Specialization, Course, Module, Lab } from '../db';

export const getAllDomains = async (_req: Request, res: Response) => {
  try {
    const allDomains = await Domain.find({ isPublished: true }).lean();
    res.json({ success: true, data: allDomains });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch domains', error: 'FETCH_DOMAINS_ERROR' });
  }
};

export const getDomainById = async (req: Request, res: Response) => {
  try {
    const domain = await Domain.findById(req.params.id).lean();
    if (!domain) return res.status(404).json({ success: false, message: 'Domain not found', error: 'NOT_FOUND' });
    res.json({ success: true, data: domain });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch domain', error: 'FETCH_DOMAIN_ERROR' });
  }
};

export const getAllSpecializations = async (_req: Request, res: Response) => {
  try {
    const allSpecs = await Specialization.find({ isPublished: true }).lean();
    res.json({ success: true, data: allSpecs });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch specializations', error: 'FETCH_SPECS_ERROR' });
  }
};

export const getSpecializationsByDomain = async (req: Request, res: Response) => {
  try {
    const specs = await Specialization.find({ domainId: req.params.domainId, isPublished: true }).lean();
    res.json({ success: true, data: specs });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch specializations', error: 'FETCH_SPECS_ERROR' });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [allCourses, total] = await Promise.all([
      Course.find({ isPublished: true }).sort({ enrollmentCount: -1 }).skip(skip).limit(limitNum).lean(),
      Course.countDocuments({ isPublished: true }),
    ]);

    res.json({
      success: true,
      data: {
        data: allCourses,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: 'FETCH_COURSES_ERROR' });
  }
};

export const getCoursesBySpecialization = async (req: Request, res: Response) => {
  try {
    const specializationCourses = await Course.find({ specializationId: req.params.specId, isPublished: true }).lean();
    res.json({ success: true, data: specializationCourses });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: 'FETCH_COURSES_ERROR' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found', error: 'NOT_FOUND' });
    res.json({ success: true, data: course });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch course', error: 'FETCH_COURSE_ERROR' });
  }
};

export const getModulesByCourse = async (req: Request, res: Response) => {
  try {
    const courseModules = await Module.find({ courseId: req.params.courseId, isPublished: true }).sort({ order: 1 }).lean();
    res.json({ success: true, data: courseModules });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch modules', error: 'FETCH_MODULES_ERROR' });
  }
};

export const getProjectsByModule = async (req: Request, res: Response) => {
  try {
    const moduleLabs = await Lab.find({ moduleId: req.params.moduleId, isPublished: true }).sort({ order: 1 }).lean();
    res.json({ success: true, data: moduleLabs });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: 'FETCH_PROJECTS_ERROR' });
  }
};
