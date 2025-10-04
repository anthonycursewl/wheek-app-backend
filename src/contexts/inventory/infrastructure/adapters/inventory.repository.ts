import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { Injectable } from "@nestjs/common";
import {  InventoryRepository, InventoryWithDetails, Inventory } from "../../domain/repos/inventory.repository";
import { FilterInventoryDto } from "../dtos/filter-inventory.dto";

@Injectable()
export class InventoryRepositoryAdapter implements InventoryRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async getAll(store_id: string, skip: number = 0, take: number = 10, filters?: FilterInventoryDto): Promise<InventoryWithDetails[]> {
        let query = `
            SELECT 
                i.id,
                s.name as store_name,
                p.name as product_name,
                wf.condition,
                wf.cost,
                i.quantity,
                i.updated_at
            FROM inventory i
            JOIN stores s ON i.store_id = s.id
            JOIN products p ON i.product_id = p.id
            LEFT JOIN w_fichas wf ON p.id = wf.product_id
            WHERE i.store_id = $1::uuid
        `;
        const params: any[] = [store_id];

        if (filters) {
            let paramIndex = 2;
            if (filters.lowStock) {
                query += ` AND i.quantity < p.low_stock_threshold`;
            }
            if (filters.outOfStock) {
                query += ` AND i.quantity = 0`;
            }
            if (filters.hasSales) {
                query += ` AND EXISTS (SELECT 1 FROM sale_items si WHERE si.product_id = p.id)`;
            }
            if (filters.hasReceptions) {
                query += ` AND EXISTS (SELECT 1 FROM reception_items ri WHERE ri.product_id = p.id)`;
            }
            if (filters.lastUpdated_start) {
                query += ` AND i.updated_at >= $${paramIndex++}`;
                params.push(new Date(filters.lastUpdated_start));
            }
            if (filters.lastUpdated_end) {
                query += ` AND i.updated_at <= $${paramIndex++}`;
                params.push(new Date(filters.lastUpdated_end));
            }
        }

        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(take, skip);

        const result: any[] = await this.prismaService.$queryRawUnsafe(query, ...params);

        return result.map((row) => ({
            id: row.id,
            store: {
                name: row.store_name,
            },
            product: {
                name: row.product_name,
                w_ficha: row.condition ? {
                    condition: row.condition,
                    cost: Number(row.cost),
                } : null,
            },
            quantity: row.quantity,
            updated_at: row.updated_at,
        }));
    }

    async deductStock(store_id: string, product_id: string, quantity: number): Promise<Inventory> {
        const currentInventory = await this.prismaService.inventory.findUnique({
            where: {
                product_store_inventory_unique: {
                    product_id,
                    store_id
                }
            }
        });

        if (!currentInventory) {
            throw new Error(`No se encontro inventario para el producto ${product_id} en la tienda ${store_id}.`);
        }

        if (currentInventory.quantity < quantity) {
            throw new Error(`No hay stock suficiente para el producto ${product_id} en la tienda ${store_id}.`);
        }

        const updatedInventory = await this.prismaService.inventory.update({
            where: {
                product_store_inventory_unique: {
                    product_id,
                    store_id
                }
            },
            data: {
                quantity: {
                    decrement: quantity
                }
            }
        });

        return {
            id: updatedInventory.id,
            product_id: updatedInventory.product_id,
            store_id: updatedInventory.store_id,
            quantity: updatedInventory.quantity,
            updated_at: updatedInventory.updated_at
        };
    }

    async deductMultipleStock(store_id: string, items: Array<{product_id: string, quantity: number}>): Promise<Inventory[]> {
        const updatedInventories = await this.prismaService.$transaction(async (prisma) => {
            const results: any[] = [];
            
            for (const item of items) {
                const currentInventory = await prisma.inventory.findUnique({
                    where: {
                        product_store_inventory_unique: {
                            product_id: item.product_id,
                            store_id
                        }
                    }
                });

                if (!currentInventory) {
                    throw new Error(`No se encontro inventario para el producto ${item.product_id} en la tienda ${store_id}.`);
                }

                if (currentInventory.quantity < item.quantity) {
                    throw new Error(`No hay stock suficiente para el producto ${item.product_id} en la tienda ${store_id}.`);
                }

                const updatedInventory = await prisma.inventory.update({
                    where: {
                        product_store_inventory_unique: {
                            product_id: item.product_id,
                            store_id
                        }
                    },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });

                results.push(updatedInventory);
            }
            
            return results;
        });

        return updatedInventories.map(inventory => ({
            id: inventory.id,
            product_id: inventory.product_id,
            store_id: inventory.store_id,
            quantity: inventory.quantity,
            updated_at: inventory.updated_at
        }));
    }

    async getByProductAndStore(store_id: string, product_id: string): Promise<Inventory | null> {
        const inventory = await this.prismaService.inventory.findUnique({
            where: {
                product_store_inventory_unique: {
                    product_id,
                    store_id
                }
            }
        });

        if (!inventory) {
            return null;
        }

        return {
            id: inventory.id,
            product_id: inventory.product_id,
            store_id: inventory.store_id,
            quantity: inventory.quantity,
            updated_at: inventory.updated_at
        };
    }
}
