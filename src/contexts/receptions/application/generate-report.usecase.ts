import { Inject, Injectable } from "@nestjs/common";
import { RECEPTION_REPOSITORY, ReceptionRepository } from "../domain/repos/reception.repository";
import { REPORT_REPOSITORY, ReportRepository } from "../domain/repos/report.repositort";
import { Result, failure, success } from "../../shared/ROP/result";

@Injectable()
export class GenerateReceptionReportUseCase {
    constructor(
        @Inject(RECEPTION_REPOSITORY)
        private readonly receptionRepository: ReceptionRepository,
        @Inject(REPORT_REPOSITORY)
        private readonly reportRepository: ReportRepository
    ) {}

    async execute(id: string): Promise<Result<Buffer, Error>> {
        try {
            const reception = await this.receptionRepository.getReceptionById(id)
            const report = await this.reportRepository.generateReportByReceptionId(reception)
            return success(report)
        } catch (error) {
            return failure(error)
        }
    }
}