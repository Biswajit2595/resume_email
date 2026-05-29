import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError, ErrorCode } from "../errors/AppError";
import { config } from "../config";

const bodySchema = z.object({
  name:  z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/),
});

export const validateResumeUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // File presence
  if (!req.file) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Resume file is required", 400);
  }

  // File size
  if (req.file.size > config.resume.maxFileSizeBytes) {
    throw new AppError(ErrorCode.FILE_TOO_LARGE, "Resume must be under 5MB", 400);
  }

  // File type
  if (!config.resume.allowedMimeTypes.includes(req.file.mimetype)) {
    throw new AppError(
      ErrorCode.UNSUPPORTED_FILE_TYPE,
      `Unsupported file type: ${req.file.mimetype}`,
      400
    );
  }

  // Body shape
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      parsed.error.errors[0].message,
      400
    );
  }

  // Attach sanitized body back
  req.body = parsed.data;
  next();
};