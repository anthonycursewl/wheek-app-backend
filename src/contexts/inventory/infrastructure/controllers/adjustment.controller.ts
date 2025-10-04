import { AdjustProductsUseCase } from "../../application/adjust-products.usecase";
import { GetAllAdjustmentsUseCase } from "../../application/get-all-adjustments.usecase";
import { AdjustProductsDto } from "../dtos/adjust-products.dto";
import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { FilterGetAdjustmentsDto } from "../dtos/filter-get-adjustments.dto";
import { AdjustmentCriteriaBuilder } from "../../builders/adjustment-criteria.builder";

@Controller('adjustments')
export class AdjustmentController {
    constructor(
        private readonly createAdjustmentUseCase: AdjustProductsUseCase,
        private readonly getAllAdjustmentsUseCase: GetAllAdjustmentsUseCase,
        private readonly adjustmentCriteriaBuilder: AdjustmentCriteriaBuilder
    ) {}

    @Post('create')
    async createAdjustment(
        @Query('store_id') store_id: string,
        @Body() adjustProductsDto: AdjustProductsDto
    ) {
        const result = await this.createAdjustmentUseCase.execute(store_id, adjustProductsDto);
        
        if (!result.isSuccess) throw new BadRequestException(result.error.message);
        return result;
    }

    @Get('get/all')
    async getAllAdjustments(
        @Query() filters: FilterGetAdjustmentsDto
    ) {
        const { where, orderBy } = this.adjustmentCriteriaBuilder.build(filters);
        const s = Number(filters.skip);
        const t = Number(filters.take);

        const result = await this.getAllAdjustmentsUseCase.execute(filters.store_id, s, t, where, orderBy);
        if (!result.isSuccess) throw new BadRequestException(result.error.message);
        return result;
    }
}
