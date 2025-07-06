import { z } from "zod";

export const getAllQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    pageSize: z.coerce.number().min(1).optional(),
    minRating: z.number().min(1).max(10).optional(),
});

export type GetAllTeaQueryDto = z.infer<typeof getAllQuerySchema>;
