import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../domain/repos/product.repository";
import { ProductRepository } from "../../domain/repos/product.repository";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";
import { Product, ProductSearchResult } from "../../domain/entities/product.entity";

@Injectable()
export class SearchProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(store_id: string, q: string): Promise<Result<ProductSearchResult[], Error>> {
        try {
            const products = await this.productRepository.search(store_id, q);
            return success(products);
        } catch (error) {
            return failure(error);
        }
    }
}