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

    async execute(id: string, providerPartial: Partial<Omit<ProviderPrimitives, 'id' | 'updated_at' | 'deleted_at' | 'created_at'>>): Promise<Result<Provider, Error>> {
        try {
            const existingProvider = await this.providerRepository.findById(id);

            if (!existingProvider) {
                return failure(new Error('Provider not found'));
            }

            const mergedProviderPrimitives: Omit<ProviderPrimitives, 'id' | 'updated_at' | 'deleted_at' | 'created_at'> = {
                name: providerPartial.name ?? existingProvider.toPrimitives().name,
                description: providerPartial.description ?? existingProvider.toPrimitives().description,
                store_id: providerPartial.store_id ?? existingProvider.toPrimitives().store_id,
                contact_phone: providerPartial.contact_phone ?? existingProvider.toPrimitives().contact_phone,
                contact_email: providerPartial.contact_email ?? existingProvider.toPrimitives().contact_email,
                is_active: providerPartial.is_active ?? existingProvider.toPrimitives().is_active,
            };

            const updatedProvider = Provider.update(id, mergedProviderPrimitives);
            const result = await this.providerRepository.save(updatedProvider);
            return success(result);
        } catch (error) {
            return failure(error as Error);
        }
    }
}
