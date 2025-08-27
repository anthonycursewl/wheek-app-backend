import { Inject, Injectable } from "@nestjs/common";
import { PROVIDER_REPOSITORY, ProviderRepository } from "../../domain/repos/provider.repository";
import { Provider } from "../../domain/entities/provider.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class GetAllProvidersUseCase {
    constructor(
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepository
    ) {}

    async execute(store_id: string, skip: number, take: number): Promise<Result<Provider[], Error>> {
        try {
            const result = await this.providerRepository.findAll(store_id, skip, take)
            return success(result)
        } catch (error) {
            return failure(error)
        }
    }
}