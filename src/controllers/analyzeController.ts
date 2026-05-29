
// import { Request, Response } from "express";
// import crypto from "crypto";

// import { uploadToR2 } from "../services/storageService";
// import { extractTextFromBuffer } from "../services/textExtractionService";
// import { analyzeResumeText } from "../services/aiService";

// import { normalizeText } from "../utils/normalizeText";

// import { Lead } from "../models/Lead";
// import { Analysis } from "../models/Analysis";
// import { parseResumeSections } from "../services/resumeParserService";


// export const analyzeResume = async (req: Request, res: Response) => {
//   try {
//     const file = req.file as Express.Multer.File;
//     const { name, email, phone } = req.body;

//     if (!file || !email || !phone) {
//       return res.status(400).json({
//         error: "Name, email, phone and resume are required",
//       });
//     }

//     // STEP 1 — Extract text
//     const extractedText = await extractTextFromBuffer(
//       file.buffer,
//       file.mimetype
//     );

//     // STEP 2 — Normalize
//     const normalizedText = normalizeText(extractedText);

//     // STEP 3 — Hash
//     const resumeHash = crypto
//       .createHash("sha256")
//       .update(normalizedText)
//       .digest("hex");

//     // STEP 4 — Check existing analysis
//     let analysisDoc = await Analysis.findOne({ resumeHash });

//     let resumeKey: string;

//     /**
//      * STEP 5 — Create lead FIRST (IMPORTANT)
//      */
//     const lead = await Lead.create({
//       name,
//       email,
//       phone,
//       resumeHash,
//     });

//     /**
//      * STEP 6 — If no analysis → create new
//      */
//     if (!analysisDoc) {
//       // upload only for new resume
//       resumeKey = await uploadToR2(
//         file.buffer,
//         file.originalname,
//         file.mimetype
//       );

//       const parsedSections = parseResumeSections(extractedText);

//       const aiResult = await analyzeResumeText(
//         JSON.stringify(parsedSections)
//       );

//       analysisDoc = await Analysis.create({
//         leadId: lead._id, // ✅ FIXED
//         resumeUrl: resumeKey,
//         resumeHash,
//         extractedText,

//         atsScore: aiResult.atsScore,
//         hirabilityIndex: aiResult.hirabilityIndex,
//         interviewChance: aiResult.interviewChance,

//         strengths: aiResult.strengths,
//         weaknesses: aiResult.weaknesses,
//         missingKeywords: aiResult.missingKeywords,
//         improvementSuggestions: aiResult.improvementSuggestions,
//       });

//     } else {
//       // reuse existing resume
//       resumeKey = analysisDoc.resumeUrl;
//     }

//     /**
//      * STEP 7 — Update lead with resume + analysis
//      */
//     lead.resumeUrl = resumeKey;
//     lead.resumeFilename = file.originalname;
//     lead.resumeMimeType = file.mimetype;
//     lead.analysisId = analysisDoc._id;

//     await lead.save();

//     return res.json({
//       message: "Resume analyzed successfully",
//       analysis: analysisDoc,
//     });

//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       error: "Analysis failed",
//     });
//   }
// };


import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";

import { uploadToR2 }            from "../services/storageService";
import { extractTextFromBuffer } from "../services/textExtractionService";
import { analyzeResumeText, CURRENT_MODEL_VERSION } from "../services/aiService";
import { normalizeText }         from "../utils/normalizeText";
import { AppError, ErrorCode }   from "../errors/AppError";

import { Lead }         from "../models/Lead";
import { Analysis }     from "../models/Analysis";
import { LeadAnalysis } from "../models/LeadAnalysis";
import { sendToEmailQueue } from "../services/emailQueue";

export const analyzeResume = async (req: Request, res: Response) => {
  // STEP 1 — Extract text
  let extractedText: string;
  try {
    extractedText = await extractTextFromBuffer(req.file!.buffer, req.file!.mimetype);
  } catch (error) {
    throw new AppError(ErrorCode.TEXT_EXTRACTION_FAILED, "Could not read resume file", 422, error);
  }

  // STEP 2 — Normalize + hash
  const normalizedText = normalizeText(extractedText);
  const resumeHash     = crypto
    .createHash("sha256")
    .update(normalizedText)
    .digest("hex");

  // STEP 3 — Cache lookup
  let analysis = await Analysis.findOne({
    resumeHash,
    modelVersion: CURRENT_MODEL_VERSION,
  });

  if (!analysis) {
    // STEP 4 — Upload + AI in parallel (independent, so no reason to wait sequentially)
    let resumeUrl:  string;
    let aiResult:   Awaited<ReturnType<typeof analyzeResumeText>>;

    try {
      [resumeUrl, aiResult] = await Promise.all([
        uploadToR2(req.file!.buffer, req.file!.originalname, req.file!.mimetype),
        analyzeResumeText(extractedText),
      ]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ErrorCode.STORAGE_UPLOAD_FAILED, "Upload or analysis failed", 500, error);
    }

    // STEP 5 — Atomic upsert (race condition safe)
    analysis = await Analysis.findOneAndUpdate(
      { resumeHash, modelVersion: CURRENT_MODEL_VERSION },
      {
        $setOnInsert: {
          resumeHash,
          resumeUrl,
          extractedText,
          modelVersion: CURRENT_MODEL_VERSION,
          ...aiResult,
        },
      },
      { upsert: true, new: true }
    );
  }

  // STEP 6 — Lead + LeadAnalysis in a transaction (atomic, no orphans)
  const session = await mongoose.startSession();

  let lead:         InstanceType<typeof Lead>;
  let leadAnalysis: InstanceType<typeof LeadAnalysis>;

  try {
    await session.withTransaction(async () => {
      const { name, email, phone } = req.body;

      [lead] = await Lead.create(
        [{
          name, email, phone,
          resumeHash,
          resumeUrl:      analysis!.resumeUrl,
          resumeFilename: req.file!.originalname,
          resumeMimeType: req.file!.mimetype,
        }],
        { session }
      );

      [leadAnalysis] = await LeadAnalysis.create(
        [{
          leadId:     lead._id,
          analysisId: analysis!._id,
        }],
        { session }
      );

      lead.leadAnalysisId = leadAnalysis._id;
      await lead.save({ session });
    });
  } catch (error) {
    throw new AppError(ErrorCode.DB_WRITE_FAILED, "Failed to save submission", 500, error);
  } finally {
    await session.endSession();
  }

  // Fire and forget — don't await
    sendToEmailQueue(
      lead!.email,
      lead!.name,
      analysis!.toObject()
    ).catch(err => console.error("Queue error:", err));

  return res.status(201).json({
    message:  "Resume analyzed successfully",
    analysis: { ...analysis!.toObject(), leadId: lead!._id },
  });
};