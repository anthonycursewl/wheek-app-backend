import { AdjustmentWithDetails, Adjustment } from "../entities/adjustment.entity"
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
}

export const ADJUSTMENT_REPOSITORY = Symbol('AdjustmentRepository')
