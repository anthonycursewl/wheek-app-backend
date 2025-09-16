import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY, ProductRepository } from "../../domain/repos/product.repository";
import { Product } from "../../domain/entities/product.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";
import { ProductFilterDto } from "../../infrastructure/dtos/products/get-products.dto";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface Criteria {
    created_at: any;
    is_active: boolean;
    orderBy: 'asc' | 'desc';
    condition: 'KG' | 'UND' | 'both';
    [key: string]: any;
}

@Injectable()
export class GetAllProductsUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository
    ) {}

    async execute(store_id: string, skip: number, take: number, filter: ProductFilterDto): Promise<Result<Product[], Error>> {
        try {
            if (!store_id) throw new Error('Store ID is required')
            const criteria = this.buildCriteria(filter);
            const products = await this.productRepository.getAll(store_id, skip, take, criteria);
            return success(products);
        } catch (error) {
            return failure(error as Error);
        }
    }

    private buildCriteria(filters: ProductFilterDto) {
        const criteria: Criteria = {
            created_at: {},
            is_active: false,
            orderBy: 'desc',
            condition: 'both'
        };
    
        if (filters.today) {
          criteria.created_at = {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
          };
        } else if (filters.thisWeek) {
          criteria.created_at = {
            gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
            lte: endOfWeek(new Date(), { weekStartsOn: 1 }),
          };
        } else if (filters.thisMonth) {
          criteria.created_at = {
            gte: startOfMonth(new Date()),
            lte: endOfMonth(new Date()),
          };
        } else if (filters.KG && filters.UND) {
          criteria.condition = 'both'
        } else if (filters.KG) {
          criteria.condition = 'KG'
        } else if (filters.UND) {
          criteria.condition = 'UND'
        }
        
        criteria.is_active = filters.deleted ? false : true;
        const orderBy = filters.dateDesc === undefined ? 'asc' : 'desc';
        return { where: criteria, orderBy };
      }
}
