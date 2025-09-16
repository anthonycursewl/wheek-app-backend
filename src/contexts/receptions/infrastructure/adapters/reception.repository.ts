import { Injectable } from "@nestjs/common";
import { ReceptionRepository } from "../../domain/repos/reception.repository";
import { ReceptionsWithItems, Reception } from "../../domain/repos/reception.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";

@Injectable()
export class ReceptionRepositoryAdapter implements ReceptionRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    /**
     * Crea una nueva recepción en la base de datos y actualiza el inventario correspondiente.
     * Todas las operaciones de base de datos se ejecutan dentro de una transacción para garantizar la integridad de los datos.
     * Si alguna operación falla, todos los cambios se revierten.
     * 
     * @param reception - Un objeto que contiene los datos de la recepción a crear, excluyendo el 'id'.
     * @returns Una Promesa que se resuelve con el objeto de la recepción recién creada, incluyendo sus items y relaciones.
     * @throws Lanza un error si la creación de la recepción o la actualización del inventario fallan.
     */
    async create(reception: Omit<Reception, 'id'>): Promise<ReceptionsWithItems> {
        try {
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
                notes: newReceptionWithItems.notes,
                items: newReceptionWithItems.items.map(item => ({
                    quantity: item.quantity,
                    cost_price: Number(item.cost_price),
                    product: {
                        name: item.product.name
                    }
                })),
                reception_date: newReceptionWithItems.reception_date,
                status: newReceptionWithItems.status,
                user: {
                    name: newReceptionWithItems.user.name
                },
            
                provider: newReceptionWithItems.provider ? {
                    name: newReceptionWithItems.provider.name
                } : null
            };
        } catch (error) {
            console.error("Error en la transacción de creación de recepción:", error);
            throw new Error(`Error al crear la recepción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    async getAll(store_id: string, skip: number, take: number): Promise<ReceptionsWithItems[]> {
        const receptions = await this.prisma.receptions.findMany({
            where: {
                store_id
            },
            skip,
            take,
            orderBy: {
                created_at: 'desc'
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