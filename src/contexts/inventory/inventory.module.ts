import { Module } from "@nestjs/common";
import { InventoryController } from "./infrastructure/controllers/inventory.controller";
import { INVENTORY_REPOSITORY } from "./domain/repos/inventory.repository";
import { InventoryRepositoryAdapter } from "./infrastructure/adapters/inventory.repository";
import { GetAllInventoryUseCase } from "./application/get-all-inventory.usecase";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { AdjustProductsUseCase } from "./application/adjust-products.usecase";
import { ADJUSTMENT_REPOSITORY } from "./domain/repos/adjustment.repository";
import { AdjustmentRepositoryAdapter } from "./infrastructure/adapters/adjusment.repository";
import { AdjustmentController } from "./infrastructure/controllers/adjustment.controller";
import { GetAllAdjustmentsUseCase } from "./application/get-all-adjustments.usecase";
import { AdjustmentCriteriaBuilder } from "./builders/adjustment-criteria.builder";

@Module({
    controllers: [InventoryController, AdjustmentController],
    imports: [],
    providers: [
        PrismaService,
        {
            provide: INVENTORY_REPOSITORY,
            useClass: InventoryRepositoryAdapter
        },
        {
            provide: ADJUSTMENT_REPOSITORY,
            useClass: AdjustmentRepositoryAdapter
        },
        GetAllInventoryUseCase,
        AdjustProductsUseCase,
        GetAllAdjustmentsUseCase,
        AdjustmentCriteriaBuilder
    ],
    exports: [INVENTORY_REPOSITORY, ADJUSTMENT_REPOSITORY]
})
export class InventoryModule {}
