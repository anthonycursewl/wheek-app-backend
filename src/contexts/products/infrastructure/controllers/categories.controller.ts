import { Post, Body, UsePipes, ValidationPipe, Controller, Get, Query, Param } from "@nestjs/common";
import { CreateCategoryUseCase } from "../../application/categories/create-category.usecase";
import { CreateCategoryDto } from "../dtos/categories/create-category.dto";
import { GetAllCategoriesUseCase } from "../../application/categories/get-all-categories.usecase";
import { Permissions } from "@/src/common/decorators/permissions.decorator";

@Controller('categories')
export class CategoryController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase
    ) {}

    @Post('create')
    @Permissions('category:create')
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() category: CreateCategoryDto) {
        return await this.createCategoryUseCase.execute(category);
    }

    @Get('all/:store_id')
    @Permissions('category:read')
    async getAllCategoriesByStoreId(@Query() query: { skip: string, take: string }, @Param('store_id') store_id: string) {
        if (!query.skip || !query.take) query.skip = '0'; query.take = '10'
        return await this.getAllCategoriesUseCase.execute(store_id, Number(query.skip), Number(query.take));
    }
}