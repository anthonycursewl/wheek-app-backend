import { Injectable } from "@nestjs/common";
import { ReceptionRepository } from "../../domain/repos/reception.repository";
import { ReceptionsWithItems, Reception } from "../../domain/repos/reception.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";

@Injectable()
export class ReceptionRepositoryAdapter implements ReceptionRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async create(reception: Omit<Reception, 'id'>): Promise<ReceptionsWithItems> {
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

            const completeReception = await this.prisma.receptions.findUnique({
                where: {
                    id: createdReception.id
                },
                select: {   
                    id: true,
                    notes: true,
                    items: {
                        select: {
                            quantity: true,
                            cost_price: true,
                            product: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    reception_date: true,
                    status: true,
                    user: {
                        select: {
                            name: true
                        }
                    },
                    provider: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            return completeReception;
        });

        if (!newReceptionWithItems) {
            throw new Error('An error occurred while creating the reception. Try again.');
        }
        
        return {
            ...newReceptionWithItems,
            items: newReceptionWithItems.items.map(item => ({
                ...item,
                cost_price: Number(item.cost_price)
            }))
        };
    }

    async getAll(store_id: string, skip: number, take: number): Promise<ReceptionsWithItems[]> {
        const receptions = await this.prisma.receptions.findMany({
            where: {
                store_id
            },
            skip,
            take,
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
                        quantity: true,
                        cost_price: true,
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        return receptions.map(reception => ({
            ...reception,
            items: reception.items.map(item => ({
                ...item,
                cost_price: Number(item.cost_price)
            }))
        }));
    }
}