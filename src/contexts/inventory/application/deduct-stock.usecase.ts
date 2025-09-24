import { Inject, Injectable } from "@nestjs/common";
import { INVENTORY_REPOSITORY, InventoryRepository } from "../domain/repos/inventory.repository";
import { failure, success, Result } from "../../shared/ROP/result";

export interface DeductStockItem {
    product_id: string;
    quantity: number;
}

export interface DeductStockRequest {
    store_id: string;
    items: DeductStockItem[];
}

@Injectable()
export class DeductStockUseCase {
    constructor(
        @Inject(INVENTORY_REPOSITORY)
        private readonly inventoryRepository: InventoryRepository
    ) {}

    async execute(request: DeductStockRequest): Promise<Result<any[], Error>> {
        try {
            // Validate request
            if (!request.store_id || !request.items || request.items.length === 0) {
                return failure(new Error('Invalid request: store_id and items are required'));
            }

            // Use the deductMultipleStock method for efficiency
            const updatedInventories = await this.inventoryRepository.deductMultipleStock(
                request.store_id,
                request.items
            );

            return success(updatedInventories);
        } catch (error) {
            return failure(error);
        }
    }

    async executeSingle(store_id: string, product_id: string, quantity: number): Promise<Result<any, Error>> {
        try {
            if (!store_id || !product_id || quantity <= 0) {
                return failure(new Error('Invalid parameters: store_id, product_id, and positive quantity are required'));
            }

            const updatedInventory = await this.inventoryRepository.deductStock(
                store_id,
                product_id,
                quantity
            );

            return success(updatedInventory);
        } catch (error) {
            return failure(error);
        }
    }
}
