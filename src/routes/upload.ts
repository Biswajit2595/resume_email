import { Router } from "express";
import { uploadResume } from "../middlewares/upload";
import { validateRequest } from "../middlewares/validateRequest";
import { uploadResumeSchema } from "../schemas/uploadSchema";
import { handleUploadResume } from "../controllers/uploadController";

const router = Router();

router.post(
  "/",
  uploadResume.single("resume"),
  validateRequest(uploadResumeSchema),
  handleUploadResume,
);

export default router;
