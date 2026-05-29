import { Request, Response } from "express";
import { Analysis } from "../models/Analysis";

export const getAnalysisById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const analysis = await Analysis.findById(id);
  if (!analysis) {
    return res.status(404).json({ error: "Analysis not found" });
  }

  return res.json({ analysis });
};
