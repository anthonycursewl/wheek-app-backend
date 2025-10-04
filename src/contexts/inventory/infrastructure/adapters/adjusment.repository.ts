import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { Injectable } from "@nestjs/common";
import { AdjustmentRepository } from "../../domain/repos/adjustment.repository";
import { Adjustment, AdjustmentWithDetails } from "../../domain/entities/adjustment.entity";
import { AdjustmentReason, Prisma } from "@prisma/client";

@Injectable()
export class AdjustmentRepositoryAdapter implements AdjustmentRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async create(adjustment: Adjustment): Promise<AdjustmentWithDetails> {
        const { items, ...adjustmentData } = adjustment;
        
        const createdAdjustment = await this.prismaService.inventory_adjustments.create({
            data: {
                store_id: adjustmentData.store_id,
                user_id: adjustmentData.user_id,
                adjustment_date: adjustmentData.adjustment_date,
                reason: adjustmentData.reason as AdjustmentReason,
                notes: adjustmentData.notes || null,
                items: {
                    create: items.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity
                    }))
                }
            },
            select: {
                id: true,
                notes: true,
                store_id: true,
                adjustment_date: true,
                reason: true,
                user: {
                    select: {
                        name: true,
                    }
                },
                items: {
                    select: {
                        quantity: true,
                        product: {
                            select: {
                                name: true,
                                w_ficha: {
                                    select: {
                                        condition: true,
                                        cost: true,
                                        benchmark: true,
                                        tax: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return {
            id: createdAdjustment.id,
            notes: createdAdjustment.notes || '',
            store_id: createdAdjustment.store_id,
            adjustment_date: createdAdjustment.adjustment_date,
            reason: createdAdjustment.reason as AdjustmentReason,
            user: {
                name: createdAdjustment.user.name
            },
            items: createdAdjustment.items.map(item => ({
                quantity: item.quantity,
                product: {
                    name: item.product.name,
                    w_ficha: item.product.w_ficha ? {
                        condition: item.product.w_ficha.condition,
                        cost: Number(item.product.w_ficha.cost),
                        benchmark: Number(item.product.w_ficha.benchmark),
                        tax: Boolean(item.product.w_ficha.tax),
                    } : {
                        condition: '',
                        cost: 0,
                        benchmark: 0,
                        tax: false,
                    }
                }
            })),
        };
    }

    async getAll(
        store_id: string,
        skip: number,
        take: number,
        where: Prisma.inventory_adjustmentsWhereInput,
        orderBy: Prisma.inventory_adjustmentsOrderByWithRelationInput[]
    ): Promise<AdjustmentWithDetails[]> {
        const adjustments = await this.prismaService.inventory_adjustments.findMany({
            where: {
                ...where,
                store_id, // Ensure store_id is always part of the where clause
            },
            skip,
            take,
            orderBy,
            select: {
                id: true,
                notes: true,
                store_id: true,
                adjustment_date: true,
                reason: true,
                user: {
                    select: {
                        name: true,
                    }
                },
                items: {
                    select: {
                        quantity: true,
                        product: {
                            select: {
                                name: true,
                                w_ficha: {
                                    select: {
                                        condition: true,
                                        cost: true,
                                        benchmark: true,
                                        tax: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return adjustments.map(adjustment => ({
            id: adjustment.id,
            notes: adjustment.notes || '',
            store_id: adjustment.store_id,
            adjustment_date: adjustment.adjustment_date,
            reason: adjustment.reason as AdjustmentReason,
            user: {
                name: adjustment.user.name
            },
            items: adjustment.items.map(item => ({
                quantity: item.quantity,
                product: {
                    name: item.product.name,
                    w_ficha: item.product.w_ficha ? {
                        condition: item.product.w_ficha.condition,
                        cost: Number(item.product.w_ficha.cost),
                        benchmark: Number(item.product.w_ficha.benchmark),
                        tax: Boolean(item.product.w_ficha.tax),
                    } : {
                        condition: '',
                        cost: 0,
                        benchmark: 0,
                        tax: false,
                    }
                }
            })),
        }));
    }
}
