import { Inject, Injectable } from "@nestjs/common";
import { PROVIDER_REPOSITORY, ProviderRepository } from "../../domain/repos/provider.repository";
import { Provider, ProviderPrimitives } from "../../domain/entities/provider.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class UpdateProviderUseCase {
    constructor(
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepository
    ) {}

    async execute(id: string, provider: Omit<ProviderPrimitives, 'id' | 'updated_at' | 'deleted_at' | 'created_at'>): Promise<Result<Provider, Error>> {
        try {
            const result = await this.providerRepository.save(Provider.update(id, provider))
            return success(result)
        } catch (error) {
            return failure(error as Error)
        }
    }
}