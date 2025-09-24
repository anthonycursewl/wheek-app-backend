import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { endOfDay, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { FilterAllReceptionDto } from "../infrastructure/dtos/filter-receptions.dto";

type ReceptionCriteria = {
    where: Prisma.receptionsWhereInput;
    orderBy: Prisma.receptionsOrderByWithRelationInput[];
}

@Injectable()
export class ReceptionCriteriaBuilder {

    build(filters: FilterAllReceptionDto): ReceptionCriteria {
        const where = this.buildWhereClause(filters);
        const orderBy = this.buildOrderByClause(filters);

        return { where, orderBy };
    }

    private buildWhereClause(filters: FilterAllReceptionDto): Prisma.receptionsWhereInput {
        const where: Prisma.receptionsWhereInput = {
            is_active: !filters.deleted
        };

        const dateFilter = this.buildDateFilter(filters);
        if (Object.keys(dateFilter).length > 0) {
            where.reception_date = dateFilter;
        }
        if (filters.provider) {
            where.provider_id = filters.provider
        }

        return where;
    }

    private buildOrderByClause(filters: FilterAllReceptionDto): Prisma.receptionsOrderByWithRelationInput[] {
        const sortOrder = filters.dateDesc === false ? 'asc' : 'desc';
        return [{ reception_date: sortOrder }];
    }

    private buildDateFilter(filters: FilterAllReceptionDto): Prisma.DateTimeFilter {
        const dateFilter: Prisma.DateTimeFilter = {};

        if (filters.today) {
            return { gte: startOfDay(new Date()), lte: endOfDay(new Date()) };
        }
        if (filters.thisWeek) {
            return { gte: startOfWeek(new Date(), { weekStartsOn: 1 }), lte: endOfWeek(new Date(), { weekStartsOn: 1 }) };
        }
        if (filters.thisMonth) {
            return { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) };
        }

        if (filters.dateRange_start) {
            dateFilter.gte = startOfDay(filters.dateRange_start);
        }
        if (filters.dateRange_end) {
            dateFilter.lte = endOfDay(filters.dateRange_end);
        }

        return dateFilter;
    }
}