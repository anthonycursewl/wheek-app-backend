import { Inject, Injectable } from "@nestjs/common";
import { CATEGORY_REPOSITORY, CategoryRepository } from "../../domain/repos/category.repository";
import { Result, failure, success } from "@shared/ROP/result";

@Injectable()
export class GetAllCategoriesUseCase {
    constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository
    ) {}

    async execute(store_id: string, skip: number, take: number) {
        try {
            if (!store_id) throw new Error('Store ID is required')
            const result = await this.categoryRepository.findAllByStoreId(store_id, skip, take)
            return success(result)
        } catch (error) {
            return failure(error as Error)
        }
    }
}