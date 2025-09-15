import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { GetAllInventoryUseCase } from "../../application/get-all-inventory.usecase";
import { InventoryWithDetails } from "../../domain/repos/inventory.repository";
import { Result } from "@/src/contexts/shared/ROP/result";
import { Permissions } from "@/src/common/decorators/permissions.decorator";

@Controller('inventory')
export class InventoryController {
    constructor(
        private readonly getAllInventoryUseCase: GetAllInventoryUseCase
    ) {}

    @Get('get/all')
    @Permissions('product:read')
    async getAll(@Query('store_id') store_id: string, @Query('skip') skip: string = '0', @Query('take') take: string = '10'): Promise<Result<InventoryWithDetails[], Error>> {
        const skipNumber = Number(skip) || 0    
        const takeNumber = Number(take) || 10
        const result = await this.getAllInventoryUseCase.execute(store_id, skipNumber, takeNumber)
        if (!result.isSuccess) {
            throw new BadRequestException(result.error.message)
        }

        return result
    }
}