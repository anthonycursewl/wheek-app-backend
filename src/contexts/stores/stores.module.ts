import { Module } from "@nestjs/common";
import { StoreController } from "./infraestructure/controllers/store.controller";
import { StoreRepositoryAdapter } from "./infraestructure/adapters/store.repository";
import { PrismaService } from "@shared/persistance/prisma.service";
import { PrismaClient } from "@prisma/client";
import { STORE_REPOSITORY } from "./domain/repos/store.repository";
import { CreateStoreUseCase } from "./application/create-store.usecase";
import { UpdateStoreUseCase } from "./application/update-store.usecase";
import { FindByIdUseCase } from "./application/findby-id.usecase";
import { FindAllByIdUseCase } from "./application/findall-by-id.usecase";

@Module({
    imports: [],
    controllers: [StoreController],
    providers: [
        PrismaService,
        {
            provide: STORE_REPOSITORY,
            useClass: StoreRepositoryAdapter,
        },
        CreateStoreUseCase,
        UpdateStoreUseCase,
        FindByIdUseCase,
        FindAllByIdUseCase
    ],
    exports: [],
})
export class StoresModule {}