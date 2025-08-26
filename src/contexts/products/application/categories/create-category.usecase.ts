import { Inject, Injectable } from "@nestjs/common";
import { CATEGORY_REPOSITORY, CategoryRepository } from "../../domain/repos/category.repository";
import { Category, CategoryPrimitives } from "../../domain/entities/categories.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class CreateCategoryUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository
    ) {}

    async execute(category: Omit<CategoryPrimitives, 'id' | 'created_at' | 'updated_at'>) {
        try {
            const result = await this.categoryRepository.save(Category.create(category))
            return success(result)
        } catch (error) {
            return failure(error as Error)
        }
    }
}