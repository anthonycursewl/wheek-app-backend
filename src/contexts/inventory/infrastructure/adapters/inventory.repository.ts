import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { Injectable } from "@nestjs/common";
import {  InventoryRepository, InventoryWithDetails } from "../../domain/repos/inventory.repository";

@Injectable()
export class InventoryRepositoryAdapter implements InventoryRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async getAll(store_id: string): Promise<InventoryWithDetails[]> {
        const inventory = await this.prismaService.inventory.findMany({
            where: {
                store_id
            },
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
}