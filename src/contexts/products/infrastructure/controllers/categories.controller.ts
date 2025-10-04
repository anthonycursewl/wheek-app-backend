import { Post, Body, UsePipes, ValidationPipe, Controller, Get, Query, Param, Put, BadRequestException, Delete } from "@nestjs/common";
import { CreateCategoryUseCase } from "../../application/categories/create-category.usecase";
import { CreateCategoryDto } from "../dtos/categories/create-category.dto";
import { GetAllCategoriesUseCase } from "../../application/categories/get-all-categories.usecase";
import { Permissions } from "@/src/common/decorators/permissions.decorator";
import { CategoryPrimitives } from "../../domain/entities/categories.entity";
import { UpdateCategoryUseCase } from "../../application/categories/update-category.usecase";
import { failure } from "@/src/contexts/shared/ROP/result";
import { FilterCategoryDto } from "../dtos/categories/filter-category.dto";
import { GetAllCategoriesQueryDto } from "../dtos/categories/get-all-categories-query.dto";
import { DeleteCategoryUseCase } from "../../application/categories/delete-category.usecase"; // Import new use case

@Controller('categories')
export class CategoryController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase,
        private readonly updateCategoryUseCase: UpdateCategoryUseCase,
        private readonly deleteCategoryUseCase: DeleteCategoryUseCase // Inject new use case
    ) {}

    @Post('create')
    @Permissions('category:create')
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() category: CreateCategoryDto) {
        return await this.createCategoryUseCase.execute(category);
    }

    @Get('all/:store_id')
    @Permissions('category:read')
    async getAllCategoriesByStoreId(
        @Param('store_id') store_id: string,
        @Query() query: GetAllCategoriesQueryDto
    ) {
        const skip = query.skip ? Number(query.skip) : 0;
        const take = query.take ? Number(query.take) : 10;

        const result = await this.getAllCategoriesUseCase.execute(store_id, skip, take, query);

        if (!result.isSuccess) throw new BadRequestException(result.error?.message || 'Error al obtener las categorías');
        return result;
    }

    @Put('update/:id')
    @Permissions('category:update')
    async update(@Param('id') id: string, @Body() category: CategoryPrimitives) {
        if (!category.name) return failure(new Error('Name is required'))
        if (!id) return failure(new Error('Wheek | El ID es requerido para actualizar. Intenta de nuevo.'))
        return await this.updateCategoryUseCase.execute(id, category);
    }

    @Delete('delete/:id') // Add new delete endpoint
    @Permissions('category:delete')
    async delete(@Param('id') id: string) {
        if (!id) throw new BadRequestException('Category ID is required');
        return this.deleteCategoryUseCase.execute(id);
    }
}
