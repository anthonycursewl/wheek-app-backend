import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { Injectable } from "@nestjs/common";
import {  InventoryRepository, InventoryWithDetails, Inventory } from "../../domain/repos/inventory.repository";

@Injectable()
export class InventoryRepositoryAdapter implements InventoryRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async getAll(store_id: string, skip: number = 0, take: number = 10): Promise<InventoryWithDetails[]> {
        const inventory = await this.prismaService.inventory.findMany({
            where: {
                store_id
            },
            skip,
            take,
            select: {
                id: true,
                store: {
                    select: {
                        name: true,
                    }
                },
                product: {
                    select: {
                        w_ficha: {
                            select: {
                                condition: true,
                                cost: true,
                            }
                        },
                        name: true,
                    }
                },
                quantity: true, 
                updated_at: true
            }
        })

        return inventory.map((inventory) => ({
           ...inventory,
           product: {
            ...inventory.product,
            w_ficha: inventory.product.w_ficha ? {
                condition: inventory.product.w_ficha.condition || '',
                cost: Number(inventory.product.w_ficha.cost)
            } : null
           } 
        }))
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