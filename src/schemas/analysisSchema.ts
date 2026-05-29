import { z } from "zod";

export const getAnalysisSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
