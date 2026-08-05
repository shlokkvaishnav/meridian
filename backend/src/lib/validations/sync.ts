import { z } from 'zod';

export const syncOptionsSchema = z.object({
  force: z.boolean().optional(),
});

export type SyncOptions = z.infer<typeof syncOptionsSchema>;
