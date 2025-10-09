import { AdjustmentWithStore } from "@/src/contexts/inventory/domain/entities/adjustment.entity";
import { ReceptionWithStore } from "./reception.repository";

export interface ReportRepository {
    generateReportByReceptionId(reception: ReceptionWithStore): Promise<Buffer>;
    generateReportByDateRange(receptions: ReceptionWithStore[], startDate: Date, endDate: Date, storeName: string): Promise<Buffer>;
    generateAdjustmentReportRange(adjusments: AdjustmentWithStore[], startDate: Date, endDate: Date, storeName: string): Promise<Buffer>;
}

export const REPORT_REPOSITORY = Symbol('ReportRepository');
