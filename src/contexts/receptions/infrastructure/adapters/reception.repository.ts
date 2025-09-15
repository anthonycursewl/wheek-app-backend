import { Injectable } from "@nestjs/common";
import { ReceptionRepository } from "../../domain/repos/reception.repository";
import { Reception, ReceptionStatus } from "../../domain/repos/reception.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";

@Injectable()
export class ReceptionRepositoryAdapter implements ReceptionRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async create(reception: Omit<Reception, 'id'>): Promise<Reception> {
        const newReceptionWithItems = await this.prisma.$transaction(async (tx) => {
            const createdReception = await tx.receptions.create({
                data: {
                    store_id: reception.store_id,
                    user_id: reception.user_id,
                    provider_id: reception.provider_id,
                    notes: reception.notes,
                    items: {
                        create: reception.items.map(item => ({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            cost_price: item.cost_price,
                        })),
                    }
                },
                include: {
                    items: true 
                }
            });

            await Promise.all(reception.items.map(item => {
                return tx.inventory.upsert({
                    where: {
                        product_store_inventory_unique: {
                            product_id: item.product_id,
                            store_id: reception.store_id,
                        }
                    },
                    update: {
                        quantity: {
                            increment: item.quantity
                        }
                    },
                    create: {
                        product_id: item.product_id,
                        store_id: reception.store_id,
                        quantity: item.quantity
                    }
                });
            }));

            return createdReception;
        });

        return {
            id: newReceptionWithItems.id,
            store_id: newReceptionWithItems.store_id,
            user_id: newReceptionWithItems.user_id,
            provider_id: newReceptionWithItems.provider_id,
            notes: newReceptionWithItems.notes,
            items: newReceptionWithItems.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                cost_price: parseFloat(item.cost_price.toString())
            }))
        };
    }

    async getAll(store_id: string) {
        const receptions = await this.prisma.receptions.findMany({
            where: {
                store_id
            },
            select: {
                id: true,
                notes: true,
                reception_date: true,
                status: true,
                provider: {
                    select: {
                        name: true,
                    }
                },
                user: {
                    select: {
                        name: true,
                    }
                },
                items: {
                    select: {
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        return receptions
    }
}