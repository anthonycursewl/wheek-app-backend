import { Inject, Injectable } from "@nestjs/common";
import { StoreRepository } from "../domain/repos/store.repository";
import { Store } from "../domain/entities/store.entity";
import { STORE_REPOSITORY } from "../domain/repos/store.repository";
import { failure, Result, success } from "../../shared/ROP/result";

@Injectable()
export class FindByIdUseCase {
    constructor(
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository,
    ) {}

    /**
     * @param id 
     * @return Result<Store | null, Error>
     */
    async execute(id: string): Promise<Result<Store | null, Error>> {
        try {
            const store = await this.storeRepository.findById(id);
            return success(store);
        } catch (error) {
            return failure(error as Error);
        }
    }
}