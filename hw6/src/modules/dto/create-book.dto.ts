import { z } from "zod";

export const createBookSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(3).optional()
});

export type CreateBookDto = z.infer<typeof createBookSchema>;
