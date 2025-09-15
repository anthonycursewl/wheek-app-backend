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

export interface InventoryRepository {
    getAll(store_id: string, skip: number, take: number): Promise<InventoryWithDetails[]>
}

export const INVENTORY_REPOSITORY = Symbol('InventoryRepository')