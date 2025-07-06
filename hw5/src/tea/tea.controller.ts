import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Res,
    UseGuards
} from "@nestjs/common";
import {
    ApiBody,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiSecurity,
    ApiTags,
    ApiTooManyRequestsResponse
} from "@nestjs/swagger";
import {
    Throttle,
    ThrottlerGuard
} from "@nestjs/throttler";
import { Response } from "express";
import { Public } from "../shared/decorators/public.decorator";

import { ZBody } from "../shared/decorators/z-body.decorator";
import { ZQuery } from "../shared/decorators/z-query.decorator";
import {
    CreateTeaDto,
    createTeaSchema
} from "../shared/dto/create-tea.dto";
import {
    ApiCreateTeaDto,
    ApiUpdateTeaDto
} from "../shared/dto/docs-dto";
import {
    getAllQuerySchema,
    GetAllTeaQueryDto
} from "../shared/dto/get-all-query.dto";
import {
    UpdateTeaDto,
    updateTeaSchema
} from "../shared/dto/update-tea.dto";

import { TeaService } from "./tea.service";


@ApiTags("Tea")
@ApiSecurity("x-api-key")
@Controller("tea")
export class TeaController {

    constructor(public teaService: TeaService) {
    }

    @Get()
    @Public()
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "pageSize", required: false, type: Number })
    @ApiQuery({ name: "minRating", required: false, type: Number })
    @ApiResponse({ status: 200, description: "List of teas" })
    public getAll(@ZQuery(getAllQuerySchema) query: GetAllTeaQueryDto) {
        return this.teaService.findAll(query);
    }

    @Get(":id")
    @ApiParam({ name: "id", type: String })
    @ApiResponse({ status: 200, description: "Single tea" })
    @ApiResponse({ status: 404, description: "Not found" })
    public getOne(@Param("id") id: string) {
        return this.teaService.findById(id);
    }

    @Post()
    @UseGuards(ThrottlerGuard)
    @Throttle({
        createTeaLimit: {
            limit: 10,
            ttl: 60
        }
    })
    @HttpCode(201)
    @ApiBody({ type: ApiCreateTeaDto })
    @ApiResponse({ status: 201, description: "Tea created" })
    @ApiTooManyRequestsResponse({ description: "Too many requests" })
    public async create(@ZBody(createTeaSchema) createTeaDto: CreateTeaDto) {
        return this.teaService.create(createTeaDto);
    }

    @Put(":id")
    @ApiParam({ name: "id", type: String })
    @ApiBody({ type: ApiUpdateTeaDto })
    @ApiResponse({ status: 200, description: "Tea updated" })
    public update(
        @Param("id") id: string,
        @ZBody(updateTeaSchema) updateTeaDto: UpdateTeaDto
    ) {
        return this.teaService.update(id, updateTeaDto);
    }

    @Delete(":id")
    @ApiParam({ name: "id", type: String })
    @ApiResponse({ status: 200, description: "Tea deleted" })
    public async remove(
        @Param("id") id: string,
        @Res() res: Response
    ) {
        await this.teaService.delete(id);

        res.status(HttpStatus.OK)
            .json({ id });
    }
}
