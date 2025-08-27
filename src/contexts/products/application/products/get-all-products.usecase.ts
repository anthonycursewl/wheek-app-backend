import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY, ProductRepository } from "../../domain/repos/product.repository";
import { Product } from "../../domain/entities/product.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class GetAllProductsUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository
    ) {}

    async execute(store_id: string, skip: number, take: number): Promise<Result<Product[], Error>> {
        try {
            if (!store_id) throw new Error('Store ID is required')
            const products = await this.productRepository.getAll(store_id, skip, take);
            return success(products);
        } catch (error) {
            return failure(error as Error);
        }
    }
}
