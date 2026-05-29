// import { Router } from "express";
// import { validateRequest } from "../middlewares/validateRequest";
// import { analyzeResumeSchema } from "../schemas/analyzeSchema";
// import { analyzeResume } from "../controllers/analyzeController";

// const router = Router();

// router.post("/", validateRequest(analyzeResumeSchema), analyzeResume);

// export default router;

import { Router } from "express";
import multer from "multer";
import { analyzeResume } from "../controllers/analyzeController";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/analyze-resume", upload.single("resume"), analyzeResume);

export default router;

// import { Router } from "express";
// import multer from "multer";
// import { analyzeResume } from "../controllers/analyzeController";

// const router = Router();

// const upload = multer({
//   storage: multer.memoryStorage(),
// });

// router.post("/analyze-resume", upload.single("resume"), analyzeResume);

// export default router;