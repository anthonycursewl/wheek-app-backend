import { Inject, Injectable } from "@nestjs/common";
import { CATEGORY_REPOSITORY, CategoryRepository } from "../../domain/repos/category.repository";
import { success, failure } from "@/src/contexts/shared/ROP/result";
import { FilterCategoryDto } from "../../infrastructure/dtos/categories/filter-category.dto";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Prisma } from "@prisma/client";

interface Criteria {
    created_at: any;
    is_active: boolean;
    orderBy: 'asc' | 'desc';
    nameAsc: string;
    nameDesc: string;
    [key: string]: any;
}

@Injectable()
export class GetAllCategoriesUseCase {
    constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository
    ) {}

    async execute(store_id: string, skip: number, take: number, filter: FilterCategoryDto) {
        try {
            if (!store_id) throw new Error('Store ID is required')
            const criteria = this.buildPrismaOptions(filter)
            const result = await this.categoryRepository.findAllByStoreId(store_id, skip, take, criteria)
            return success(result)
        } catch (error) {
            return failure(error as Error)
        }
    }

    private buildPrismaOptions(filters: FilterCategoryDto) {
        const where: Prisma.categoriesWhereInput = {};
        const orderBy: Prisma.categoriesOrderByWithRelationInput[] = [];

        where.is_active = filters.deleted ? false : true;

        const dateFilter: Prisma.DateTimeFilter = {};
        if (filters.today) {
            dateFilter.gte = startOfDay(new Date());
            dateFilter.lte = endOfDay(new Date());
        } else if (filters.thisWeek) {
            dateFilter.gte = startOfWeek(new Date(), { weekStartsOn: 1 });
            dateFilter.lte = endOfWeek(new Date(), { weekStartsOn: 1 });
        } else if (filters.thisMonth) {
            dateFilter.gte = startOfMonth(new Date());
            dateFilter.lte = endOfMonth(new Date());
        }
        if (Object.keys(dateFilter).length > 0) {
            where.created_at = dateFilter;
        }
        if (filters.nameAsc) {
            orderBy.push({ name: 'asc' });
        } else if (filters.nameDesc) {
            orderBy.push({ name: 'desc' });
        }

        if (filters.dateDesc) {
            orderBy.push({ created_at: 'desc' });
        } else {
            orderBy.push({ created_at: 'asc' });
        }
        
        if (orderBy.length === 0) {
            orderBy.push({ created_at: 'desc' });
        }

        return { where, orderBy };
    }
}