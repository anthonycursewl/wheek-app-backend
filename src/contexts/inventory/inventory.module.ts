import { Module } from "@nestjs/common";
import { InventoryController } from "./infrastructure/controllers/inventory.controller";
import { INVENTORY_REPOSITORY } from "./domain/repos/inventory.repository";
import { InventoryRepositoryAdapter } from "./infrastructure/adapters/inventory.repository";
import { GetAllInventoryUseCase } from "./application/get-all-inventory.usecase";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";

@Module({
    controllers: [InventoryController],
    imports: [],
    providers: [
        PrismaService,
        {
            provide: INVENTORY_REPOSITORY,
            useClass: InventoryRepositoryAdapter
        },
        GetAllInventoryUseCase
    ],
    exports: [INVENTORY_REPOSITORY]
})
export class InventoryModule {}