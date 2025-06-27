import { Injectable, Inject } from "@nestjs/common";
import { Store } from "../domain/entities/store.entity";
import { STORE_REPOSITORY } from "../domain/repos/store.repository";
import { StoreRepository } from "../domain/repos/store.repository";
import { failure, Result, success } from "../../shared/ROP/result";

@Injectable()
export class FindAllByIdUseCase {
    constructor(
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository,
    ) {}

    async execute(id: string): Promise<Result<Store[], Error>> {
        try {
            const stores = await this.storeRepository.findAllById(id);
            return success(stores);
        } catch (error) {
            return failure(error as Error);
        }
    }
}
    