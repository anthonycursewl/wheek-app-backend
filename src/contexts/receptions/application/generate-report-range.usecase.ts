import { Inject, Injectable } from "@nestjs/common";
import { RECEPTION_REPOSITORY, ReceptionRepository } from "../domain/repos/reception.repository";
import { REPORT_REPOSITORY, ReportRepository } from "../domain/repos/report.repositort";
import { Result, failure, success } from "../../shared/ROP/result";
import { STORE_REPOSITORY, StoreRepository } from "@/src/contexts/stores/domain/repos/store.repository";

@Injectable()
export class GenerateReportRangeUseCase {
    constructor(
        @Inject(RECEPTION_REPOSITORY)
        private readonly receptionRepository: ReceptionRepository,
        @Inject(REPORT_REPOSITORY)
        private readonly reportRepository: ReportRepository,
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository,
    ) {}

    async execute(storeId: string, startDate: Date, endDate: Date): Promise<Result<Buffer, Error>> {
        try {
            const store = await this.storeRepository.findById(storeId);
            if (!store) {
                return failure(new Error('Tienda no encontrada.'));
            }

            const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;
            if (endDate.getTime() - startDate.getTime() > oneYearInMilliseconds) {
                return failure(new Error('El rango de fechas no puede ser mayor a un año.'));
            }

            const receptions = await this.receptionRepository.getReceptionsByDateRange(storeId, startDate, endDate);
            const report = await this.reportRepository.generateReportByDateRange(receptions, startDate, endDate, store.getName());
            return success(report);
        } catch (error) {
            return failure(error);
        }
    }
}
