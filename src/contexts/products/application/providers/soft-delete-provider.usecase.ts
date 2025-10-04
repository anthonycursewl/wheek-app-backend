import { Inject, Injectable, NotFoundException } from "@nestjs/common";
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
            const existingProvider = await this.providerRepository.findById(id);
            if (!existingProvider) {
                throw new NotFoundException('Provider not found');
            }

            const newStatus = !existingProvider.is_active_status;
            const updatedProvider = await this.providerRepository.delete(id, newStatus); // Modify delete to toggle status

            if (!updatedProvider) {
                throw new Error('Failed to toggle provider status');
            }

            return success(updatedProvider);
        } catch (error) {
            return failure(error);
        }
    }
}
