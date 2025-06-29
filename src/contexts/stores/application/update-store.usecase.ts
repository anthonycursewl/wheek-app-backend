import { Inject, Injectable } from "@nestjs/common";
import { failure, Result, success } from "../../shared/ROP/result";
import { StoreRepository } from "../domain/repos/store.repository";
import { Store } from "../domain/entities/store.entity";
import { Transaction } from "@shared/persistance/transactions";
import { STORE_REPOSITORY } from "../domain/repos/store.repository";


/**
 * UseCase to update a store, following its
 * it's property rules to organize new values
 * In order to update a new Object we're supposed
 * Pass the store object with th new values to return  
 *  
 * @param store
 * @param tx
 * 
 * @return Result<Store, Error>
 */
@Injectable()
export class UpdateStoreUseCase {
    constructor(
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository,
    ) {}    

    async execute(store: Store, tx?: Transaction): Promise<Result<Store, Error>> {
        try {
            const updated = await this.storeRepository.update(store, tx);
            return success(updated);
        } catch (error) {
            return failure(error as Error);
        }
    }
}
    