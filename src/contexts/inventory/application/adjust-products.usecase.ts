import { Inject, Injectable } from "@nestjs/common";
import { ADJUSTMENT_REPOSITORY, AdjustmentRepository } from "../domain/repos/adjustment.repository";
import { INVENTORY_REPOSITORY, InventoryRepository } from "../domain/repos/inventory.repository";
import { failure, success, Result } from "../../shared/ROP/result";
import { Adjustment, AdjustmentItem, AdjustmentWithDetails } from "../domain/entities/adjustment.entity";
import { AdjustProductsDto } from "../infrastructure/dtos/adjust-products.dto";

@Injectable()
export class AdjustProductsUseCase {
    constructor(
        @Inject(ADJUSTMENT_REPOSITORY)
        private readonly adjustmentRepository: AdjustmentRepository,
        @Inject(INVENTORY_REPOSITORY)
        private readonly inventoryRepository: InventoryRepository
    ) {}

    async execute(adjustProductsDto: AdjustProductsDto): Promise<Result<AdjustmentWithDetails, Error>> {
        try {
            if (adjustProductsDto.items.length === 0) {
                throw new Error('No se proporcionaron items para la ajuste. Intenta de nuevo!')
            }
            const adjustmentItems: Omit<AdjustmentItem, 'id' | 'created_at' | 'updated_at'>[] = adjustProductsDto.items.map(item => ({
                adjustment_id: '',
                product_id: item.product_id,
                quantity: item.quantity
            }));

            const adjustment: Omit<Adjustment, 'id' | 'created_at' | 'updated_at'> = {
                store_id: adjustProductsDto.store_id,
                user_id: adjustProductsDto.user_id,
                adjustment_date: adjustProductsDto.adjustment_date || new Date(),
                reason: adjustProductsDto.reason,
                notes: adjustProductsDto.notes || '',
                items: adjustmentItems
            };

            const createdAdjustment = await this.adjustmentRepository.create(adjustment);
            
            const stockDeductionItems = adjustProductsDto.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));
            
            const updatedInventories = await this.inventoryRepository.deductMultipleStock(
                adjustProductsDto.store_id,
                stockDeductionItems
            );
            
            return success(createdAdjustment);
        } catch (error) {
            return failure(error);
        }
    }
}