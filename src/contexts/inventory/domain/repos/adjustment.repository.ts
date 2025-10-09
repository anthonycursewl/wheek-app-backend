import { AdjustmentWithDetails, Adjustment, AdjustmentWithStore } from "../entities/adjustment.entity"
import { Prisma } from "@prisma/client";

export interface AdjustmentRepository {
    create(adjustment: Adjustment): Promise<AdjustmentWithDetails>
    getAll(
        store_id: string,
        skip: number,
        take: number,
        where: Prisma.inventory_adjustmentsWhereInput,
        orderBy: Prisma.inventory_adjustmentsOrderByWithRelationInput[]
    ): Promise<AdjustmentWithDetails[]>
    getAllWithStore(store_id: string, startDate: Date, endDate: Date): Promise<AdjustmentWithStore[] | []>
}

export const ADJUSTMENT_REPOSITORY = Symbol('AdjustmentRepository')
