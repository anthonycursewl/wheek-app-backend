import { Inject, Injectable } from "@nestjs/common";
import { Result, failure, success } from "../../shared/ROP/result";
import { REPORT_REPOSITORY, ReportRepository } from "../../receptions/domain/repos/report.repositort";
import { STORE_REPOSITORY, StoreRepository } from "../../stores/domain/repos/store.repository";
import { ADJUSTMENT_REPOSITORY, AdjustmentRepository } from "../domain/repos/adjustment.repository";

@Injectable()
export class GenerateAdjusmentReportRangeUseCase {
    constructor(
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository, 
        @Inject(REPORT_REPOSITORY) 
        private readonly reportRepository: ReportRepository,  
        @Inject(ADJUSTMENT_REPOSITORY) 
        private readonly adjustmentRepository: AdjustmentRepository
    ) {}

    async execute(storeId: string, startDate: Date, endDate: Date): Promise<Result<Buffer, Error>> {
        try {            
            const store = await this.storeRepository.findById(storeId)
            if (!store) return failure(new Error('Store not found'))
            const adjusments = await this.adjustmentRepository.getAllWithStore(storeId, startDate, endDate)
            console.log(`Adjusments: ${JSON.stringify(adjusments)}`)

            if (!adjusments || adjusments.length === 0) {
                return failure(new Error('No se encontraron registros de ajustes en el rango de fechas especificado.'));
            }

            const report = await this.reportRepository.generateAdjustmentReportRange(adjusments, startDate, endDate, store.getName())
            return success(report)
        } catch (error) {
            return failure(error)
        }
    }
}
