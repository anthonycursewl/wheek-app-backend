import { Inject, Injectable } from "@nestjs/common";
import { PROVIDER_REPOSITORY } from "../../domain/repos/provider.repository";
import { ProviderRepository } from "../../domain/repos/provider.repository";
import { Result, failure, success } from "@shared/ROP/result";
import { Provider } from "../../domain/entities/provider.entity";

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