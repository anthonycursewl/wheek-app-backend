import { Injectable, Inject } from "@nestjs/common";
import { failure, Result, success } from "../../shared/ROP/result";
import { StoreRepository } from "../domain/repos/store.repository";
import { Store } from "../domain/entities/store.entity";
import { Transaction } from "@shared/persistance/transactions";
import { STORE_REPOSITORY } from "../domain/repos/store.repository";

@Injectable()
export class CreateStoreUseCase {
    constructor(
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository,
    ) {}

    async execute(store: Store, tx?: Transaction): Promise<Result<Store, Error>> {
        try {
            const created = await this.storeRepository.create(store, tx);
            return success(created);
        } catch (error) {
            return failure(error as Error);
        }
    }
}