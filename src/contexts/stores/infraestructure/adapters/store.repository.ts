import { Injectable } from '@nestjs/common';
import { Transaction } from '@shared/persistance/transactions';
import { PrismaService } from '@shared/persistance/prisma.service';
import { PrismaClient } from '@prisma/client';
import { StoreRepository } from '../../domain/repos/store.repository';
import { Store } from '../../domain/entities/store.entity';
import { StoreData } from '../../domain/entities/store.entity';
import { StoreMember } from '../../domain/entities/store-member.entity';

@Injectable()
export class StoreRepositoryAdapter implements StoreRepository {
  constructor(private readonly prisma: PrismaService) {}

    private mapPrismaStoreToDomain(store: StoreData): Store {
        return Store.fromPrimitive({
            id: store.id,
            name: store.name,
            description: store.description,
            is_active: store.is_active,
            created_at: store.created_at,
            owner: store.owner
        });
    }

    async create(store: Store, tx?: Transaction): Promise<Store> {
        const client = tx as PrismaClient || this.prisma;
        try {
            const storeData = store.toPrimitive()
            console.log(storeData)
            const storeMember = StoreMember.create({
                user_id: storeData.owner,
                store_id: storeData.id,
            })
            const storeMemberData = storeMember.toPrimitive()
            console.log(storeMemberData)

            const created = await client.stores.create({
                data: { 
                    ...storeData,
                    store_members: {
                        create: {
                            id: storeMemberData.id,
                            created_at: storeMemberData.created_at,
                            is_member_active: storeMemberData.is_member_active,
                            users: {
                                connect: {
                                    id: storeData.owner
                                }
                            }
                        }
                    }
                }
            })

            return this.mapPrismaStoreToDomain(created);
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    async update(store: Store, tx?: Transaction): Promise<Store> {
        const client = tx as PrismaClient || this.prisma;
        try {
            const updated = await client.stores.update({
                where: {
                    id: store.getId(),
                },
                data: store.toPrimitive(),
            });

            return this.mapPrismaStoreToDomain(updated);
        } catch (error) {
            throw error;
        }
    }

    async findById(id: string, tx?: Transaction): Promise<Store | null> {
        const client = tx as PrismaClient || this.prisma;
        try {
            const store = await client.stores.findUnique({
                where: {
                    id,
                },
            });

            if (!store) {
                return null;
            }

            return this.mapPrismaStoreToDomain(store);
        } catch (error) {
            throw error;
        }
    }

    async findAllById(id: string, tx?: Transaction): Promise<Store[]> {
        const client = tx as PrismaClient || this.prisma;
        try {
            const stores = await client.stores.findMany({
                where: {
                    is_active: true,
                    store_members: {
                        some: {
                            user_id: id,
                            is_member_active: true,
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    is_active: true,
                    owner: true,
                    created_at: true,
                }
            })

            return stores.map((store) => this.mapPrismaStoreToDomain(store));   
        } catch (error) {
            throw error;
        }
    }

} 