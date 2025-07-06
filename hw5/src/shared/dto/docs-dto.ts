import { createZodDto } from "@anatine/zod-nestjs";
import { createTeaSchema } from "./create-tea.dto";
import { updateTeaSchema } from "./update-tea.dto";

export class ApiCreateTeaDto extends createZodDto(createTeaSchema) {
}

export class ApiUpdateTeaDto extends createZodDto(updateTeaSchema) {
}
