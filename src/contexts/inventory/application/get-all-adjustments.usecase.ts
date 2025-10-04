import { Inject, Injectable } from "@nestjs/common";
import { ADJUSTMENT_REPOSITORY, AdjustmentRepository } from "../domain/repos/adjustment.repository";
import { Result } from "@/src/contexts/shared/ROP/result";
import { AdjustmentWithDetails } from "../domain/entities/adjustment.entity";
import { success, failure } from "@/src/contexts/shared/ROP/result";
import { Prisma } from "@prisma/client";

@Injectable()
export class GetAllAdjustmentsUseCase {
    constructor(
        @Inject(ADJUSTMENT_REPOSITORY)
        private readonly adjustmentRepository: AdjustmentRepository
    ) {}

    async execute(
        store_id: string,
        skip: number,
        take: number,
        where: Prisma.inventory_adjustmentsWhereInput,
        orderBy: Prisma.inventory_adjustmentsOrderByWithRelationInput[]
    ): Promise<Result<AdjustmentWithDetails[], Error>> {
        try {
            if (!store_id) throw new Error('Store ID is required')
            const inventory = await this.adjustmentRepository.getAll(store_id, skip, take, where, orderBy)
            return success(inventory)
        } catch (error) {
            return failure(error)
        }
    }
}
