import {
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put,
    Res
} from "@nestjs/common";
import { Response } from "express";

import { ZBody } from "../shared/decorators/z-body.decorator";
import { ZQuery } from "../shared/decorators/z-query.decorator";
import {
    CreateTeaDto,
    createTeaSchema
} from "../shared/dto/create-tea.dto";
import {
    getAllQuerySchema,
    GetAllTeaQueryDto
} from "../shared/dto/get-all-query.dto";
import {
    UpdateTeaDto,
    updateTeaSchema
} from "../shared/dto/update-tea.dto";

import { TeaService } from "./tea.service";

@Controller("tea")
export class TeaController {

    constructor(public teaService: TeaService) {
    }

    @Get()
    public getAll(@ZQuery(getAllQuerySchema) query: GetAllTeaQueryDto) {
        return this.teaService.findAll(query);
    }

    @Get(":id")
    public getOne(@Param("id") id: string) {
        return this.teaService.findById(id);
    }

    @Post()
    public create(
        @ZBody(createTeaSchema)
        createTeaDto: CreateTeaDto
    ) {
        return this.teaService.create(createTeaDto);
    }

    @Put(":id")
    public update(
        @Param("id") id: string,
        @ZBody(updateTeaSchema) updateTeaDto: UpdateTeaDto
    ) {
        return this.teaService.update(id, updateTeaDto);
    }

    @Delete(":id")
    public remove(
        @Param("id") id: string,
        @Res() res: Response
    ) {
        this.teaService.delete(id);

        res.status(HttpStatus.OK)
            .json({ id });
    }
}
