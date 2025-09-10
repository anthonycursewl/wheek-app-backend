import { Provider } from "../entities/provider.entity"

export interface ProviderRepository {
    save(provider: Provider): Promise<Provider>
    findAll(store_id: string, skip: number, take: number): Promise<Provider[]>
    delete(id: string): Promise<Provider | null>
}

export const PROVIDER_REPOSITORY = Symbol('ProviderRepository')