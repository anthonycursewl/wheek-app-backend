import { Inject, Injectable } from "@nestjs/common";
import { PROVIDER_REPOSITORY, ProviderRepository, ProviderCriteria } from "../../domain/repos/provider.repository";
import { Provider } from "../../domain/entities/provider.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";
import { FilterAllProviderDto } from "../../infrastructure/dtos/providers/filter-all-provider.dto";
import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

@Injectable()
export class GetAllProvidersUseCase {
    constructor(
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepository
    ) {}

    async execute(store_id: string, skip: number, take: number, filters: FilterAllProviderDto): Promise<Result<Provider[], Error>> {
        try {
            const criteria = this.buildPrismaOptions(filters)
            const result = await this.providerRepository.findAll(store_id, skip, take, criteria)
            return success(result)
        } catch (error) {
            return failure(error)
        }
    }

    private buildPrismaOptions(filters: FilterAllProviderDto): ProviderCriteria {
        const where: Prisma.providersWhereInput = {};
        const orderBy: Prisma.providersOrderByWithRelationInput[] = [];

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

        if (orderBy.length === 0) {
            if (filters.dateDesc) {
                orderBy.push({ created_at: 'desc' });
            } else {
                orderBy.push({ created_at: 'asc' });
            }
        }

        if (orderBy.length === 0) {
            orderBy.push({ created_at: 'desc' });
        }

        return { where, orderBy };
    } 
}