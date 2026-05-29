// import { Schema, model, Document, Types } from "mongoose";

// export interface LeadDocument extends Document {
//   name: string;
//   email: string;
//   phone: string;

//   resumeUrl?: string;
//   resumeMimeType?: string;
//   resumeFilename?: string;
//   resumeHash?: string;

//   analysisId?: Types.ObjectId;

//   createdAt: Date;
//   updatedAt: Date;
// }

// const LeadSchema = new Schema<LeadDocument>(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
//       index: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     resumeUrl: {
//       type: String,
//       required: false,
//     },

//     resumeMimeType: {
//       type: String,
//       required: false,
//     },

//     resumeFilename: {
//       type: String,
//       required: false,
//     },

//     // used for duplicate resume detection
//     resumeHash: {
//       type: String,
//       required: false,
//       index: true,
//     },

//     analysisId: {
//       type: Schema.Types.ObjectId,
//       ref: "Analysis",
//       required: false,
//     },
//   },
//   { timestamps: true }
// );

// export const Lead = model<LeadDocument>("Lead", LeadSchema);


// models/Lead.ts — updated fields
import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  name:           string;
  email:          string;
  phone:          string;
  resumeHash:     string;
  resumeUrl:      string;
  resumeFilename: string;
  resumeMimeType: string;
  leadAnalysisId: mongoose.Types.ObjectId; // → LeadAnalysis

  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name:           { type: String, required: true },
    email:          { type: String, required: true },
    phone:          { type: String, required: true },
    resumeHash:     { type: String, required: true },
    resumeUrl:      { type: String, required: true },
    resumeFilename: { type: String, required: true },
    resumeMimeType: { type: String, required: true },
    leadAnalysisId: { type: Schema.Types.ObjectId, ref: "LeadAnalysis" },
  },
  { timestamps: true }
);

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);