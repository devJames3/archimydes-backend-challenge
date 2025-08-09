import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: errors,
        },
      });
    }
    req.body = result.data;
    next();
  };
