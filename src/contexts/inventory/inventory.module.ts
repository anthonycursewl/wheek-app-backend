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
import { GenerateAdjusmentReportRangeUseCase } from "./application/generate-adjusment-report-range.usecase";
import { STORE_REPOSITORY } from "../stores/domain/repos/store.repository";
import { StoreRepositoryAdapter } from "../stores/infraestructure/adapters/store.repository";
import { REPORT_REPOSITORY } from "../receptions/domain/repos/report.repositort";
import { ReportRepositoryAdapter } from "../receptions/infrastructure/adapters/report.repository";

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
        {
            provide: STORE_REPOSITORY,
            useClass: StoreRepositoryAdapter    
        },
        {
            provide: REPORT_REPOSITORY,
            useClass: ReportRepositoryAdapter    
        },  
        GetAllInventoryUseCase,
        AdjustProductsUseCase,
        GetAllAdjustmentsUseCase,
        AdjustmentCriteriaBuilder,
        GenerateAdjusmentReportRangeUseCase
    ],
    exports: [INVENTORY_REPOSITORY, ADJUSTMENT_REPOSITORY]
})
export class InventoryModule {}
