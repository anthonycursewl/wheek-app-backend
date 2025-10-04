import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { GetAllInventoryUseCase } from "../../application/get-all-inventory.usecase";
import { InventoryWithDetails } from "../../domain/repos/inventory.repository";
import { Result } from "@/src/contexts/shared/ROP/result";
import { Permissions } from "@/src/common/decorators/permissions.decorator";
import { GetAllInventoryQueryDto } from "../dtos/get-all-inventory-query.dto";

@Controller('inventory')
export class InventoryController {
    constructor(
        private readonly getAllInventoryUseCase: GetAllInventoryUseCase
    ) {}

    @Get('get/all')
    @Permissions('product:read')
    async getAll(
        @Query() query: GetAllInventoryQueryDto,
    ): Promise<Result<InventoryWithDetails[], Error>> {
        const skipNumber = Number(query.skip) || 0    
        const takeNumber = Number(query.take) || 10
        const result = await this.getAllInventoryUseCase.execute(query.store_id, skipNumber, takeNumber, query)
        if (!result.isSuccess) {
            throw new BadRequestException(result.error.message)
        }

        return result
    }
}
