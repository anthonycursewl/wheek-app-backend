import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CATEGORY_REPOSITORY, CategoryRepository } from "../../domain/repos/category.repository";
import { Category } from "../../domain/entities/categories.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class DeleteCategoryUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository
    ) {}

    async execute(id: string): Promise<Result<Category | null, Error>> {
        try {
            const existingCategory = await this.categoryRepository.findById(id);
            if (!existingCategory) {
                throw new NotFoundException('Category not found');
            }

            const newStatus = !existingCategory.is_active_status;
            const updatedCategory = await this.categoryRepository.delete(id, newStatus);

            if (!updatedCategory) {
                throw new Error('Failed to toggle category status');
            }

            return success(updatedCategory);
        } catch (error) {
            return failure(error);
        }
    }
}
