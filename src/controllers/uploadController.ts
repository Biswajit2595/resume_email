import { Request, Response } from "express";
import { Lead } from "../models/Lead";
import { uploadToR2 } from "../services/storageService";
import { getUploadedResume } from "../middlewares/upload";

export const handleUploadResume = async (req: Request, res: Response) => {
  const { leadId } = req.body;

  const lead = await Lead.findById(leadId);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }

  const file = getUploadedResume(req);

  const resumeUrl = await uploadToR2(
    file.buffer,
    file.originalname,
    file.mimetype,
  );

  // Store resume metadata on the lead so it can be used for analysis.
  lead.set({
    resumeUrl,
    resumeMimeType: file.mimetype,
    resumeFilename: file.originalname,
  });
  await lead.save();

  return res.status(200).json({ leadId: lead._id, resumeUrl });
};
