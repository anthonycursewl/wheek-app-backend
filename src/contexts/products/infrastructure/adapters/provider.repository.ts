import { Injectable } from "@nestjs/common";
import { ProviderRepository } from "../../domain/repos/provider.repository";
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
            }
        })

        return Provider.fromPrimitives(createdProvider)
    }

    async findAll(store_id: string, skip: number, take: number): Promise<Provider[]> {
        const providers = await this.prisma.providers.findMany({
            where: {
                store_id: store_id
            },
            orderBy: {
                created_at: 'desc'
            },
            skip,
            take,
        })

        return providers.map(provider => Provider.fromPrimitives(provider))
    }
}