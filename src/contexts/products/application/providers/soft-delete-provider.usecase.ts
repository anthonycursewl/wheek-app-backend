import { Inject, Injectable } from "@nestjs/common";
import { PROVIDER_REPOSITORY, ProviderRepository } from "../../domain/repos/provider.repository";
import { Provider } from "../../domain/entities/provider.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class SoftDeleteProviderUseCase {
    constructor(
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepository
    ) {}

    async execute(id: string): Promise<Result<Provider | null, Error>> {
        try {
            const result = await this.providerRepository.delete(id)
            if (!result) throw new Error('Provider not found')
            return success(result)
        } catch (error) {
            return failure(error)
        }
    }
}