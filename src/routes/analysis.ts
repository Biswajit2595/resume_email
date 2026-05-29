import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { getAnalysisSchema } from "../schemas/analysisSchema";
import { getAnalysisById } from "../controllers/analysisController";

const router = Router();

router.get("/:id", validateRequest(getAnalysisSchema), getAnalysisById);

export default router;
