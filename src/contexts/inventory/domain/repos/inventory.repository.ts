export interface Inventory {
    id: string;
    product_id: string;
    store_id: string;
    quantity: number;
    updated_at: Date;
}

export interface InventoryWithDetails {
    id: string;
    store: {
        name: string
    },
    product: {
        name: string
        w_ficha: {
            condition: string
            cost: number
        } | null
    },
    quantity: number,
    updated_at: Date
}

import { FilterInventoryDto } from "../../infrastructure/dtos/filter-inventory.dto";

export interface InventoryRepository {
    getAll(store_id: string, skip: number, take: number, filters?: FilterInventoryDto): Promise<InventoryWithDetails[]>
    
    /**
     * Deduct quantity from inventory for a specific product in a store
     * @param store_id The store identifier
     * @param product_id The product identifier
     * @param quantity The quantity to deduct
     * @returns Promise<Inventory> The updated inventory record
     * @throws Error if insufficient stock or inventory not found
     */
    deductStock(store_id: string, product_id: string, quantity: number): Promise<Inventory>
    
    /**
     * Deduct stock for multiple products in a store
     * @param store_id The store identifier
     * @param items Array of items with product_id and quantity to deduct
     * @returns Promise<Inventory[]> Array of updated inventory records
     * @throws Error if any item has insufficient stock or inventory not found
     */
    deductMultipleStock(store_id: string, items: Array<{product_id: string, quantity: number}>): Promise<Inventory[]>
    
    /**
     * Get current stock for a specific product in a store
     * @param store_id The store identifier
     * @param product_id The product identifier
     * @returns Promise<Inventory | null> The inventory record or null if not found
     */
    getByProductAndStore(store_id: string, product_id: string): Promise<Inventory | null>
}

export const INVENTORY_REPOSITORY = Symbol('InventoryRepository')
