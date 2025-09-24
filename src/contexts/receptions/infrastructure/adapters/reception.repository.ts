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
                        is_active: true,
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
                is_active: newReceptionWithItems.is_active,
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

    async getAll(store_id: string, skip: number, take: number, criteria: any): Promise<ReceptionsWithItems[]> {
        const receptions = await this.prisma.receptions.findMany({
            where: {
                store_id,
                ...criteria.where
            },
            skip,
            take,
            orderBy: criteria.orderBy,
            select: {
                id: true,
                notes: true,
                is_active: true,
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

    /**
     * Elimina una recepción de la base de datos (borrado suave o permanente)
     * y actualiza el inventario correspondiente restando las cantidades.
     * Todas las operaciones de base de datos se ejecutan dentro de una transacción.
     * 
     * @param id - El ID de la recepción a eliminar
     * @param isSoftDelete - Si es true, realiza un borrado suave (marcar como cancelada), si es false, elimina permanentemente
     * @returns Una Promesa que se resuelve con el objeto de la recepción eliminada
     * @throws Lanza un error si la eliminación de la recepción o la actualización del inventario fallan
     */
    async delete(id: string, isSoftDelete: boolean): Promise<ReceptionsWithItems> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                let result;

                if (isSoftDelete) {
                    const reception = await tx.receptions.findUnique({
                        where: { id },
                        include: {
                            items: true
                        }
                    });
    
                    if (!reception) {
                        throw new Error(`Recepción con ID ${id} no encontrada`);
                    }
    
                    await Promise.all(reception.items.map(item => {
                        return tx.inventory.update({
                            where: {
                                product_store_inventory_unique: {
                                    product_id: item.product_id,
                                    store_id: reception.store_id,
                                }
                            },
                            data: {
                                quantity: {
                                    decrement: item.quantity
                                }
                            }
                        });
                    }));

                    const rawResult = await tx.receptions.update({
                        where: { id },
                        data: {
                            status: 'CANCELLED',
                            is_active: false
                        },
                        select: {
                            id: true,
                            notes: true,
                            is_active: true,
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
                    
                    result = {
                        id: rawResult.id,
                        notes: rawResult.notes,
                        is_active: rawResult.is_active,
                        items: rawResult.items.map(item => ({
                            quantity: item.quantity,
                            cost_price: Number(item.cost_price),
                            product: {
                                name: item.product.name
                            }
                        })),
                        reception_date: rawResult.reception_date,
                        status: rawResult.status,
                        user: {
                            name: rawResult.user.name
                        },
                        provider: rawResult.provider ? {
                            name: rawResult.provider.name
                        } : null
                    };
                } else {
                    const receptionToDelete = await tx.receptions.findUnique({
                        where: { id },
                        select: {
                            id: true,
                            notes: true,
                            is_active: true,
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

                    if (!receptionToDelete) {
                        throw new Error(`Recepción con ID ${id} no encontrada para eliminación`);
                    }

                    await tx.receptions.delete({
                        where: { id }
                    });
                    
                    result = {
                        id: receptionToDelete.id,
                        notes: receptionToDelete.notes,
                        is_active: receptionToDelete.is_active,
                        items: receptionToDelete.items.map(item => ({
                            quantity: item.quantity,
                            cost_price: Number(item.cost_price),
                            product: {
                                name: item.product.name
                            }
                        })),
                        reception_date: receptionToDelete.reception_date,
                        status: receptionToDelete.status,
                        user: {
                            name: receptionToDelete.user.name
                        },
                        provider: receptionToDelete.provider ? {
                            name: receptionToDelete.provider.name
                        } : null
                    };
                }

                return result;
            });
        } catch (error) {
            console.error("Error en la transacción de eliminación de recepción:", error);
            throw new Error(`Error al eliminar la recepción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
}