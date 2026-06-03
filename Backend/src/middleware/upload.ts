import { Request, Response, NextFunction } from 'express';

// Stub upload middleware to avoid runtime errors
export const upload = {
  single: (_fieldName: string) => (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
  array: (_fieldName: string, _maxCount?: number) => (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
  fields: (_fields: any[]) => (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
};

// Export both names for compatibility
export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount);
export const uploadFields = (fields: any[]) => upload.fields(fields);

export const handleUpload = (fieldName: string) => upload.single(fieldName);
export const handleMultipleUploads = (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount);