import { ReceptionWithStore } from "./reception.repository";

export interface ReportRepository {
    generateReportByReceptionId(reception: ReceptionWithStore): Promise<Buffer>;
}

export const REPORT_REPOSITORY = Symbol('ReportRepository');