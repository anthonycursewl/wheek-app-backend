import { Inject, Injectable } from "@nestjs/common";
import { Category, CategoryPrimitives } from "../../domain/entities/categories.entity";
import { failure, Result, success } from "@/src/contexts/shared/ROP/result";
import { CategoryRepository } from "../../domain/repos/category.repository";
import { CATEGORY_REPOSITORY } from "../../domain/repos/category.repository";

@Injectable()
export class UpdateCategoryUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository
    ) {}

    async execute(id: string, data: CategoryPrimitives): Promise<Result<Category, Error>> {
        try {
            const category = await this.categoryRepository.findById(id);
            const categoryPrimitives = category.toPrimitives();
            
            const updatedCategory = Category.update({ 
                name: data.name, 
                store_id: categoryPrimitives.store_id, 
                id, 
                created_at: categoryPrimitives.created_at,
                is_active: data.is_active ?? categoryPrimitives.is_active
            });
            
            const result = await this.categoryRepository.update(id, updatedCategory);
            return success(result);
        } catch (error) {
            return failure(error);
        }
    }
}