import { Request, Response } from 'express';
import { Lead } from '../models/Lead';

export const createLead = async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;

  const lead = await Lead.create({ name, email, phone });

  res.status(201).json({
    id: lead._id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    createdAt: lead.createdAt,
  });
};

export const getLeadsWithAnalysis = async (req: Request, res: Response) => {
  const leads = await Lead.find().populate({
    path: 'analysisId',
    select:
      'atsScore hirabilityIndex interviewChance strengths weaknesses missingKeywords improvementSuggestions resumeUrl',
  });

  const formatted = leads.map((lead) => ({
    id: lead._id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    resumeUrl: lead.resumeUrl,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    analysis: lead.leadAnalysisId ?? null,
  }));

  res.json({ leads: formatted });
};
