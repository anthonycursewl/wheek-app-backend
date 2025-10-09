import { Module } from "@nestjs/common";
import { ReceptionsController } from "./infrastructure/controllers/receptions.controller";
import { CreateReceptionUseCase } from "./application/create-reception.usecase";
import { RECEPTION_REPOSITORY } from "./domain/repos/reception.repository";
import { ReceptionRepositoryAdapter } from "./infrastructure/adapters/reception.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { GetAllReceptionsUseCase } from "./application/get-receptions.usecase";
import { ReceptionCriteriaBuilder } from "./builders/reception-criteria.builder";
import { DeleteReceptionUseCase } from "./application/delete-reception.usecase";
import { REPORT_REPOSITORY } from "./domain/repos/report.repositort";
import { ReportRepositoryAdapter } from "./infrastructure/adapters/report.repository";
import { GenerateReceptionReportUseCase } from "./application/generate-report.usecase";
import { GenerateReportRangeUseCase } from "./application/generate-report-range.usecase";

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
        {
            provide: REPORT_REPOSITORY,
            useClass: ReportRepositoryAdapter
        },
        CreateReceptionUseCase,
        GetAllReceptionsUseCase,
        ReceptionCriteriaBuilder,
        DeleteReceptionUseCase,
        GenerateReceptionReportUseCase,
        GenerateReportRangeUseCase
    ]
})
export class ReceptionsModule {}