import { Provider } from "../entities/provider.entity"
import { Prisma } from "@prisma/client"

export type ProviderCriteria = {
    where: Prisma.providersWhereInput;
    orderBy: Prisma.providersOrderByWithRelationInput[];
};

export interface ProviderRepository {
    save(provider: Provider): Promise<Provider>
    findAll(store_id: string, skip: number, take: number, criteria: ProviderCriteria): Promise<Provider[]>
    findById(id: string): Promise<Provider | null>
    delete(id: string, isActive: boolean): Promise<Provider | null>
}

export const PROVIDER_REPOSITORY = Symbol('ProviderRepository')
