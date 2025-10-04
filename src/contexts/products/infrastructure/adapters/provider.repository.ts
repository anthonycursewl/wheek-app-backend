import { Injectable } from "@nestjs/common";
import { ProviderRepository, ProviderCriteria } from "../../domain/repos/provider.repository";
import { Provider } from "../../domain/entities/provider.entity";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";

@Injectable()
export class ProviderRepositoryAdapter implements ProviderRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(provider: Provider): Promise<Provider> {
        const providerPrimitives = provider.toPrimitives()
        
        const createData = {
            ...providerPrimitives,
            is_active: providerPrimitives.is_active ?? undefined,
        };

        const createdProvider = await this.prisma.providers.upsert({
            where: {
                id: providerPrimitives.id
            },
            create: createData,
            update: {
                name: providerPrimitives.name,
                description: providerPrimitives.description,
                is_active: providerPrimitives.is_active ?? undefined,
                contact_email: providerPrimitives.contact_email,
                contact_phone: providerPrimitives.contact_phone,
                updated_at: providerPrimitives.updated_at,
            },
            select: {
                id: true,
                name: true,
                description: true,
                store_id: true,
                created_at: true,
                deleted_at: true,
                updated_at: true,
                contact_phone: true,
                contact_email: true,
                is_active: true,
            }
        })

        return Provider.fromPrimitives(createdProvider)
    }

    async findAll(store_id: string, skip: number, take: number, criteria: ProviderCriteria): Promise<Provider[]> {
        const providers = await this.prisma.providers.findMany({
            where: {
                ...criteria.where,
                store_id: store_id,
            },
            orderBy: criteria.orderBy,
            skip,
            take,
        })

        return providers.map(provider => Provider.fromPrimitives(provider))
    }

    async findById(id: string): Promise<Provider | null> {
        const provider = await this.prisma.providers.findUnique({
            where: {
                id: id,
            },
        });

        if (!provider) {
            return null;
        }

        return Provider.fromPrimitives(provider);
    }

    async delete(id: string, isActive: boolean): Promise<Provider | null> {
        const updatedProvider = await this.prisma.providers.update({
            where: { id },
            data: { is_active: isActive },
            select: {
                id: true,
                name: true,
                description: true,
                store_id: true,
                created_at: true,
                deleted_at: true,
                updated_at: true,
                contact_phone: true,
                contact_email: true,
                is_active: true,
            }
        });
        return Provider.fromPrimitives(updatedProvider);
    }
}
