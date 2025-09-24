import { AdjustmentWithDetails, Adjustment } from "../entities/adjustment.entity"

export interface AdjustmentRepository {
    create(adjustment: Adjustment): Promise<AdjustmentWithDetails>
    getAll(store_id: string, skip: number, take: number, criteria?: any): Promise<AdjustmentWithDetails[]>
}

export const ADJUSTMENT_REPOSITORY = Symbol('AdjustmentRepository')