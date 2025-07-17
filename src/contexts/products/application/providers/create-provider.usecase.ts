import { Inject, Injectable } from "@nestjs/common";
import { PROVIDER_REPOSITORY, ProviderRepository } from "../../domain/repos/provider.repository";
import { Provider, ProviderPrimitives } from "../../domain/entities/provider.entity";
import { Result, failure, success } from "@shared/ROP/result";

@Injectable()
export class CreateProviderUseCase {
    constructor(
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepository
    ) {}

    async execute(data: Omit<ProviderPrimitives, 'id' | 'created_at'>): Promise<Result<Provider, Error>> {
        try {
            const result = await this.providerRepository.save(Provider.create(data))
            return success(result)
        } catch (error) {
            return failure(error as Error)
        }
    }
}