import { Module } from "@nestjs/common";
import { ReceptionsController } from "./infrastructure/controllers/receptions.controller";
import { CreateReceptionUseCase } from "./application/create-reception.usecase";
import { RECEPTION_REPOSITORY } from "./domain/repos/reception.repository";
import { ReceptionRepositoryAdapter } from "./infrastructure/adapters/reception.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { GetAllReceptionsUseCase } from "./application/get-receptions.usecase";

@Module({
    imports: [],
    controllers: [ReceptionsController],
    providers: [
        {
            provide: PrismaService,
            useClass: PrismaService
        },
        {
            provide: RECEPTION_REPOSITORY,
            useClass: ReceptionRepositoryAdapter
        },
        CreateReceptionUseCase,
        GetAllReceptionsUseCase
    ]
})
export class ReceptionsModule {}