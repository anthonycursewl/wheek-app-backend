import { Injectable } from "@nestjs/common";
import { Result } from "@/src/contexts/shared/ROP/result";
import { INVENTORY_REPOSITORY, InventoryRepository } from "../domain/repos/inventory.repository";
import { Inject } from "@nestjs/common";
import { success, failure } from "@/src/contexts/shared/ROP/result";
import { InventoryWithDetails } from "../domain/repos/inventory.repository";

@Injectable()
export class GetAllInventoryUseCase {
    constructor(
        @Inject(INVENTORY_REPOSITORY)
        private readonly inventoryRepository: InventoryRepository
    ) {}

    async execute(store_id: string, skip: number, take: number): Promise<Result<InventoryWithDetails[], Error>> {
        try {
            if (!store_id) throw new Error('Store ID is required')
            const inventory = await this.inventoryRepository.getAll(store_id, skip, take)
            return success(inventory)
        } catch (error) {
            return failure(error)
        }
    }
}