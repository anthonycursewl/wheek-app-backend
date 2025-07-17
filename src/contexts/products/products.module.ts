import { Module } from "@nestjs/common";
import { ProductController } from "./infrastructure/controllers/products.controller";
import { PRODUCT_REPOSITORY } from "./domain/repos/product.repository";
import { ProductRepositoryAdapter } from "./infrastructure/adapters/products.repository";
import { CreateProductUseCase } from "./application/products/create-product.usecase";
import { PrismaService } from "../shared/persistance/prisma.service";
import { CategoryController } from "./infrastructure/controllers/categories.controller";
import { CATEGORY_REPOSITORY } from "./domain/repos/category.repository";
import { CategoryRepositoryAdapter } from "./infrastructure/adapters/category.repository";
import { CreateCategoryUseCase } from "./application/categories/create-category.usecase";
import { ProvidersController } from "./infrastructure/controllers/providers.controller";
import { PROVIDER_REPOSITORY } from "./domain/repos/provider.repository";
import { ProviderRepositoryAdapter } from "./infrastructure/adapters/provider.repository";
import { CreateProviderUseCase } from "./application/providers/create-provider.usecase";
import { GetAllProvidersUseCase } from "./application/providers/get-all-providers.usecase";
import { GetAllCategoriesUseCase } from "./application/categories/get-all-categories.usecase";

@Module({
    controllers: [ProductController, CategoryController, ProvidersController],
    providers: [
        PrismaService,
        {
            provide: PRODUCT_REPOSITORY,
            useClass: ProductRepositoryAdapter
        },
        {
            provide: CATEGORY_REPOSITORY,
            useClass: CategoryRepositoryAdapter
        },
        {
            provide: PROVIDER_REPOSITORY,
            useClass: ProviderRepositoryAdapter
        },
        CreateProductUseCase,
        CreateCategoryUseCase,
        CreateProviderUseCase,
        GetAllProvidersUseCase,
        GetAllCategoriesUseCase
    ]
})
export class ProductsModule {}