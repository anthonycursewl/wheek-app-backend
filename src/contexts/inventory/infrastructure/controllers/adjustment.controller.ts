import { AdjustProductsUseCase } from "../../application/adjust-products.usecase";
import { GetAllAdjustmentsUseCase } from "../../application/get-all-adjustments.usecase";
import { AdjustProductsDto } from "../dtos/adjust-products.dto";
import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { FilterGetAdjustmentsDto } from "../dtos/filter-get-adjustments.dto";

@Controller('adjustments')
export class AdjustmentController {
    constructor(
        private readonly createAdjustmentUseCase: AdjustProductsUseCase,
        private readonly getAllAdjustmentsUseCase: GetAllAdjustmentsUseCase
    ) {}

    @Post('create')
    async createAdjustment(@Body() adjustProductsDto: AdjustProductsDto) {
        const result = await this.createAdjustmentUseCase.execute(adjustProductsDto);
        
        if (!result.isSuccess) throw new BadRequestException(result.error.message);
        return result;
    }

    @Get('get/all')
    async getAllAdjustments(
        @Query() criteria: FilterGetAdjustmentsDto
    ) {
        console.log(criteria.criteria)
        const s = Number(criteria.skip) 
        const t = Number(criteria.take)

        const result = await this.getAllAdjustmentsUseCase.execute(criteria.store_id, s, t, criteria)
        if (!result.isSuccess) throw new BadRequestException(result.error.message);
        return result;
    }
}