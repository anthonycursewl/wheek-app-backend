import { Injectable, Inject } from '@nestjs/common'; // Added Inject
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { PrismaService } from '@/src/shared/persistance/prisma.service';
import { StoreRepository } from '../../domain/repos/store.repository';
import { Store } from '../../domain/entities/store.entity';
import { StoreData } from '../../domain/entities/store.entity';

@Injectable()
export class StoreRepositoryAdapter implements StoreRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

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
        const client = tx || this.prisma;   
        try {
            const created = await client.stores.create({
                data: store.toPrimitive(),
            });

            return this.mapPrismaStoreToDomain(created);
        } catch (error) {
            throw error;
        }
    }

    async update(store: Store, tx?: Transaction): Promise<Store> {
        const client = tx || this.prisma;   
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
        const client = tx || this.prisma;   
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
        const client = tx || this.prisma;   
        try {
            const stores = await client.stores.findMany({
                where: {
                    is_active: true,
                    OR: [
                        {
                            owner: id
                        },
                        {
                            user_roles: {
                                some: {
                                    user_id: id,
                                    is_active: true
                                }
                            }
                        }
                    ]
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
