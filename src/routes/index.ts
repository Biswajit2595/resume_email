// import { Router } from "express";
// import leadRouter from "./lead";
// import uploadRouter from "./upload";
// import analyzeRouter from "./analyze";
// import analysisRouter from "./analysis";

// const router = Router();

// router.use("/lead", leadRouter);
// router.use("/upload-resume", uploadRouter);
// router.use("/analyze-resume", analyzeRouter);
// router.use("/analysis", analysisRouter);

// router.get("/health", (_req, res) => res.json({ ok: true }));

// export default router;

import { Router } from "express";
import leadRouter from "./lead";
import analyzeRoutes from "./analyze";
import analysisRouter from "./analysis";

const router = Router();

router.use("/leads", leadRouter);
router.use(analyzeRoutes);
router.use("/analysis", analysisRouter);

export default router;
